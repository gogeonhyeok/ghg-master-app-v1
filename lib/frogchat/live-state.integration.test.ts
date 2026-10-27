/** @jest-environment node */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createHash, randomUUID } from "node:crypto";
import type Redis from "ioredis";
import type { Db } from "mongodb";

jest.mock("server-only", () => ({}));

import { actInPond, joinPond, leavePond, readPond, speakInPond } from "./store";
import { publishPondMotion, subscribePondChanges } from "./realtime";
import { pondRedis } from "./redis";
import { PRESENCE_MS } from "./types";

// Opt in with a disposable local Redis; never use the app's configured service.
const integration = process.env.FROGCHAT_TEST_REDIS_URL ? describe : describe.skip;
const keys = ["FROGCHAT_REDIS_URL", "REDIS_URL", "FROGCHAT_REDIS_CHANNEL", "MONGODB_URI", "MONGODB_URL", "VERCEL"] as const;
const previous = keys.map(key => process.env[key]);
const shared = globalThis as typeof globalThis & { frogchatRedis?: Redis; frogchatHub?: unknown; frogchatMemory?: unknown; frogchatDatabase?: Promise<Db> };

integration("live state against real Redis", () => {
  let now: number;
  let storageKeys: string[];
  const clients: Redis[] = [];
  const releases: (() => void)[] = [];
  const messages = new Map<string, { _id: string; pond?: string; expiresAt: Date }>();
  const collection = jest.fn((name: string) => {
    if (name !== "frogchat_messages") throw new Error("Live residents must never access MongoDB");
    return {
      findOne: async ({ _id }: { _id: string }) => messages.get(_id) ?? null,
      insertOne: async (message: { _id: string; expiresAt: Date }) => { messages.set(message._id, message); },
      find: (filter: { pond?: string }) => {
        const query = {
          sort: () => query, limit: () => query,
          toArray: async () => [...messages.values()].filter(message => (message.pond ?? "classic") === (filter.pond ?? "classic") && message.expiresAt.getTime() > now).reverse(),
        };
        return query;
      },
    };
  });

  function nextInstance() {
    // Separate connections and globals, sharing only Redis and message storage.
    delete shared.frogchatRedis;
    delete shared.frogchatHub;
    const client = pondRedis();
    clients.push(client);
    return client;
  }

  beforeEach(() => {
    keys.forEach(key => delete process.env[key]);
    process.env.FROGCHAT_REDIS_URL = process.env.FROGCHAT_TEST_REDIS_URL;
    process.env.FROGCHAT_REDIS_CHANNEL = `frogchat:test:${randomUUID()}`;
    process.env.MONGODB_URI = "mongodb://must-not-connect.invalid";
    shared.frogchatDatabase = Promise.resolve({ collection } as unknown as Db);
    delete shared.frogchatMemory;
    now = Date.now();
    jest.spyOn(Date, "now").mockImplementation(() => now);
    const namespace = createHash("sha256").update(process.env.FROGCHAT_REDIS_CHANNEL).digest("hex");
    storageKeys = ["residents", "expiries"].map(suffix => `frogchat:{${namespace}}:live:v1:${suffix}`);
    messages.clear();
    collection.mockClear();
    nextInstance();
  });

  afterEach(async () => {
    releases.splice(0).forEach(release => release());
    // Only delete this test's unique namespace; never FLUSHDB.
    try { await clients[0]?.del(...storageKeys); }
    finally {
      clients.splice(0).forEach(client => client.disconnect());
      delete shared.frogchatRedis;
      delete shared.frogchatHub;
      delete shared.frogchatDatabase;
      delete shared.frogchatMemory;
      jest.restoreAllMocks();
      keys.forEach((key, index) => {
        if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index];
      });
    }
  });

  it("moves without connecting to MongoDB and restores the same state on another instance", async () => {
    const session = await joinPond();
    collection.mockClear();
    // Even an unavailable history database cannot block an established movement.
    delete shared.frogchatDatabase;
    const moved = await actInPond(session.token, { type: "move", direction: 1 }, now);
    expect(moved).toMatchObject({ accepted: true, frog: { x: 52.5, motionVersion: 1 } });
    expect(collection).not.toHaveBeenCalled();
    shared.frogchatDatabase = Promise.resolve({ collection } as unknown as Db);
    nextInstance();
    const snapshot = await readPond(session.token);
    expect(snapshot.frogs[0]).toMatchObject(moved.frog);
    expect(JSON.stringify(snapshot)).not.toContain(session.token);
    expect(snapshot.frogs[0]).not.toHaveProperty("_id");
    expect(snapshot.frogs[0]).not.toHaveProperty("expiresAt");
  });

  it("atomically rejects concurrent moves and jumps sharing one session", async () => {
    const session = await joinPond();
    const pending = [actInPond(session.token, { type: "move", direction: 1 }, now)];
    nextInstance();
    pending.push(...Array.from({ length: 7 }, () => actInPond(session.token, { type: "move", direction: 1 }, now)));
    const actions = await Promise.all(pending);
    expect(actions.filter(result => result.accepted)).toHaveLength(1);
    const jumps = await Promise.all(Array.from({ length: 8 }, (_, id) => actInPond(session.token, { type: "jump", jumpId: `jump-${id}` }, now)));
    expect(jumps.filter(result => result.accepted)).toHaveLength(1);
    now += 650;
    expect(await actInPond(session.token, { type: "jump", jumpId: "next-jump" }, now)).toMatchObject({ accepted: true, frog: { jumpedAt: now, jumpId: "next-jump", motionVersion: 3, x: 52.5 } });
    expect((await readPond(session.token)).frogs[0].motionVersion).toBe(3);
  });

  it("preserves queued receipt times, bounds, and increasing movement versions", async () => {
    const session = await joinPond();
    const receivedAt = now;
    now += 30_000; // Server processes normally spaced inputs after a delay.
    for (let index = 0; index < 80; index++) {
      const result = await actInPond(session.token, { type: "move", direction: index < 30 ? 1 : -1 }, receivedAt + index * 150);
      expect(result.accepted).toBe(true);
      expect(result.frog.motionVersion).toBe(index + 1);
      expect(result.frog.x).toBeGreaterThanOrEqual(6);
      expect(result.frog.x).toBeLessThanOrEqual(94);
    }
    expect((await readPond(session.token)).frogs[0]).toMatchObject({ x: 6, facing: -1, motionVersion: 80 });
  });

  it("renews active residents, prunes abandoned sessions, and rejects departed tokens", async () => {
    const absent = await joinPond();
    const active = await joinPond();
    now += PRESENCE_MS - 1000;
    await actInPond(active.token, { type: "move", direction: -1 });
    now += 1001;
    expect((await readPond(active.token)).frogs.map(frog => frog.id)).toEqual([active.selfId]);
    await expect(actInPond(absent.token, { type: "jump" })).rejects.toMatchObject({ status: 401 });
    expect(await pondRedis().hlen(storageKeys[0])).toBe(1);
    expect(await pondRedis().zcard(storageKeys[1])).toBe(1);
    for (const key of storageKeys) {
      expect(await pondRedis().pttl(key)).toBeGreaterThan(0);
      expect(await pondRedis().pttl(key)).toBeLessThanOrEqual(PRESENCE_MS);
    }
    await leavePond(active.token);
    await expect(actInPond(active.token, { type: "jump" })).rejects.toMatchObject({ status: 401 });
  });

  it("keeps room history in MongoDB with shared speech limits and retry deduplication", async () => {
    const classic = await joinPond();
    const pixel = await joinPond("pixel");
    await speakInPond(classic.token, "A stored croak", "one");
    nextInstance();
    expect((await speakInPond(classic.token, "A stored croak", "one")).messages).toHaveLength(1);
    await expect(speakInPond(classic.token, "Too fast", "two")).rejects.toMatchObject({ status: 429 });
    now += 801;
    expect((await speakInPond(classic.token, "Another croak", "two")).messages).toHaveLength(2);
    const otherRoom = await readPond(pixel.token);
    expect(otherRoom.messages).toEqual([]);
    expect(otherRoom.frogs.map(frog => frog.id)).toEqual([pixel.selfId]);
    expect(messages.size).toBe(2);
  });

  it("broadcasts confirmed Redis state across subscribers and isolates channel namespaces", async () => {
    const session = await joinPond();
    const deliveries: Promise<unknown>[] = [];
    async function watch() {
      let deliver!: (event: unknown) => void;
      deliveries.push(new Promise(resolve => { deliver = resolve; }));
      releases.push(await subscribePondChanges(deliver, jest.fn()));
    }
    await watch();
    nextInstance();
    await watch();
    const movement = await actInPond(session.token, { type: "move", direction: 1 });
    await publishPondMotion(movement.pond, movement.frog);
    // JSON transport omits optional fields whose value is undefined.
    const expected = JSON.parse(JSON.stringify({ type: "motion", frog: movement.frog, serverTime: now }));
    expect(await Promise.all(deliveries)).toEqual([expected, expected]);
    process.env.FROGCHAT_REDIS_CHANNEL += ":other-deployment";
    await expect(actInPond(session.token, { type: "jump" })).rejects.toMatchObject({ status: 401 });
  });

  it("requires a fresh session after live state is lost", async () => {
    const session = await joinPond();
    await pondRedis().del(...storageKeys);
    await expect(readPond(session.token)).rejects.toMatchObject({ status: 401 });
    expect((await joinPond()).selfId).not.toBe(session.selfId);
  });
});
