/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));

import { joinPond, leavePond, readPond, speakInPond } from "./store";
import { MESSAGE_LIFETIME_MS, PRESENCE_MS } from "./types";

const originalUri = process.env.MONGODB_URI;
const originalUrl = process.env.MONGODB_URL;
const shared = globalThis as typeof globalThis & { frogchatMemory?: unknown };

beforeEach(() => {
  delete process.env.MONGODB_URI;
  delete process.env.MONGODB_URL;
  delete shared.frogchatMemory;
  jest.useFakeTimers({ now: new Date("2026-10-14T08:00:00Z") });
});

afterEach(() => {
  jest.useRealTimers();
  if (originalUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = originalUri;
  if (originalUrl === undefined) delete process.env.MONGODB_URL;
  else process.env.MONGODB_URL = originalUrl;
});

it("puts anonymous visitors in the same pond and keeps session secrets private", async () => {
  const first = await joinPond();
  const second = await joinPond();
  expect(second.selfId).not.toBe(first.selfId);
  expect(second.frogs.map(frog => frog.id)).toEqual(expect.arrayContaining([first.selfId, second.selfId]));
  const received = await speakInPond(first.token, "Hello from my lily pad!", "one");
  expect(received.messages[0]).toMatchObject({ frogId: first.selfId, text: "Hello from my lily pad!" });
  const otherView = await readPond(second.token);
  expect(otherView.messages).toEqual(received.messages);
  expect(JSON.stringify(otherView)).not.toContain(first.token);
  expect(JSON.stringify(otherView)).not.toContain(second.token);
  expect(otherView.frogs[0]).not.toHaveProperty("_id");
});

it("deduplicates retried croaks and rate limits distinct messages", async () => {
  const frog = await joinPond();
  await speakInPond(frog.token, "Ribbit", "one");
  const retry = await speakInPond(frog.token, "Ribbit", "one");
  expect(retry.messages).toHaveLength(1);
  await expect(speakInPond(frog.token, "Too soon", "two")).rejects.toMatchObject({ status: 429 });
  jest.advanceTimersByTime(801);
  expect((await speakInPond(frog.token, "Another croak", "two")).messages).toHaveLength(2);
});

it("removes departed frogs and rejects their old session", async () => {
  const first = await joinPond();
  const second = await joinPond();
  await leavePond(first.token);
  expect((await readPond(second.token)).frogs.map(frog => frog.id)).toEqual([second.selfId]);
  await expect(speakInPond(first.token, "Ghost croak", "one")).rejects.toMatchObject({ status: 401 });
});

it("expires abandoned visitors while keeping visitors with a heartbeat", async () => {
  const absent = await joinPond();
  const active = await joinPond();
  jest.advanceTimersByTime(PRESENCE_MS - 1000);
  await readPond(active.token);
  jest.advanceTimersByTime(1001);
  expect((await readPond(active.token)).frogs.map(frog => frog.id)).toEqual([active.selfId]);
  await expect(readPond(absent.token)).rejects.toMatchObject({ status: 401 });
});

it("bounds chat history and expires older messages", async () => {
  const frog = await joinPond();
  for (let index = 0; index < 105; index++) {
    jest.advanceTimersByTime(801);
    await speakInPond(frog.token, `Croak ${index}`, String(index));
  }
  const pond = await readPond(frog.token);
  expect(pond.messages).toHaveLength(100);
  expect(pond.messages[0].text).toBe("Croak 5");
  jest.advanceTimersByTime(MESSAGE_LIFETIME_MS + 1);
  const newcomer = await joinPond();
  expect(newcomer.messages).toHaveLength(0);
  expect(newcomer.frogs).toHaveLength(1);
});

it("isolates residents, message history, and departures by pond", async () => {
  const classic = await joinPond();
  const woods = await joinPond("woodland");
  const neighbor = await joinPond("woodland");
  const pixel = await joinPond("pixel");
  await speakInPond(woods.token, "Only in the woods", "one");
  expect((await readPond(neighbor.token)).messages[0].text).toBe("Only in the woods");
  for (const visitor of [classic, pixel]) {
    const view = await readPond(visitor.token);
    expect(view.frogs.map(frog => frog.id)).toEqual([visitor.selfId]);
    expect(view.messages).toEqual([]);
  }
  expect(await leavePond(woods.token)).toBe("woodland");
  expect((await readPond(neighbor.token)).frogs.map(frog => frog.id)).toEqual([neighbor.selfId]);
});

it("keeps each pond’s history allowance independent", async () => {
  const woods = await joinPond("woodland");
  await speakInPond(woods.token, "Keep this quiet croak", "one");
  const classic = await joinPond();
  for (let index = 0; index < 105; index++) {
    jest.advanceTimersByTime(801);
    await speakInPond(classic.token, `Busy pond ${index}`, String(index));
    if (index % 50 === 0) await readPond(woods.token);
  }
  expect((await readPond(classic.token)).messages).toHaveLength(100);
  expect((await readPond(woods.token)).messages.map(message => message.text)).toEqual(["Keep this quiet croak"]);
});

it("keeps records from before room support in the original pond", async () => {
  const old = await joinPond();
  await speakInPond(old.token, "An old croak", "one");
  const memory = shared.frogchatMemory as { residents: Map<string, { pond?: string }>; messages: { pond?: string }[] };
  for (const resident of memory.residents.values()) delete resident.pond;
  for (const message of memory.messages) delete message.pond;
  const woods = await joinPond("woodland");
  expect(woods.messages).toEqual([]);
  expect(woods.frogs.map(frog => frog.id)).toEqual([woods.selfId]);
  const classic = await joinPond();
  expect(classic.frogs.map(frog => frog.id)).toContain(old.selfId);
  expect(classic.messages[0].text).toBe("An old croak");
});

it("places visitors on separate starting positions and bounds movement to the room", async () => {
  const { actInPond } = await import("./store");
  const first = await joinPond(); const second = await joinPond();
  expect(first.frogs[0].x).toBe(50);
  expect(second.frogs.find(frog => frog.id === second.selfId)?.x).not.toBe(50);
  await actInPond(first.token, { type: "move", direction: 1 });
  expect((await readPond(first.token)).frogs.find(frog => frog.id === first.selfId)?.x).toBe(52.5);
  expect(await actInPond(first.token, { type: "move", direction: 1 })).toBeNull();
  for (let index = 0; index < 80; index++) {
    jest.advanceTimersByTime(150);
    await actInPond(first.token, { type: "move", direction: index < 30 ? 1 : -1 });
  }
  const view = await readPond(second.token);
  expect(view.frogs.find(frog => frog.id === first.selfId)).toMatchObject({ x: 6, facing: -1 });
  expect(view.frogs.find(frog => frog.id === second.selfId)?.x).toBe(second.frogs.find(frog => frog.id === second.selfId)?.x);
});

it("persists jumps with a cooldown and rejects actions from departed sessions", async () => {
  const { actInPond } = await import("./store");
  const frog = await joinPond();
  await actInPond(frog.token, { type: "jump" });
  expect((await readPond(frog.token)).frogs[0].jumpedAt).toBe(Date.now());
  expect(await actInPond(frog.token, { type: "jump" })).toBeNull();
  jest.advanceTimersByTime(650);
  expect(await actInPond(frog.token, { type: "jump" })).toBe("classic");
  await leavePond(frog.token);
  await expect(actInPond(frog.token, { type: "jump" })).rejects.toMatchObject({ status: 401 });
});
