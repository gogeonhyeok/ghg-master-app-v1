/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { EventEmitter } from "node:events";

jest.mock("server-only", () => ({}));
jest.mock("ioredis", () => {
  const clients: FakeRedis[] = [];
  class FakeRedis extends EventEmitter {
    status = "wait";
    channel?: string;
    constructor() { super(); clients.push(this); }
    async connect() { this.status = "ready"; }
    async subscribe(channel: string) { this.channel = channel; }
    async publish(channel: string, message: string) {
      for (const client of clients) if (client.status === "ready" && client.channel === channel) client.emit("message", channel, message);
    }
    disconnect() { this.status = "end"; this.emit("end"); }
  }
  return { __esModule: true, default: FakeRedis, clients };
});

let api: typeof import("./realtime");
const shared = globalThis as typeof globalThis & { frogchatHub?: unknown };
const keys = ["FROGCHAT_REDIS_URL", "REDIS_URL", "VERCEL", "MONGODB_URI", "MONGODB_URL"] as const;
const previous = keys.map(key => process.env[key]);
const releases: (() => void)[] = [];

beforeEach(async () => {
  api = await import("./realtime");
  keys.forEach(key => delete process.env[key]);
  process.env.FROGCHAT_REDIS_URL = "redis://test-only";
  delete shared.frogchatHub;
});
afterEach(() => {
  releases.splice(0).forEach(release => release());
  delete shared.frogchatHub;
  keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
});

it("delivers Redis notifications to separate instance hubs and stops after unsubscribe", async () => {
  const first = jest.fn(); const second = jest.fn();
  const failure = jest.fn();
  const removeFirst = await api.subscribePondChanges(first, failure);
  releases.push(removeFirst);
  // Simulate another function's globals while both Redis subscribers remain alive.
  delete shared.frogchatHub;
  const removeSecond = await api.subscribePondChanges(second, failure);
  releases.push(removeSecond);
  await api.publishPondChange();
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  removeFirst();
  await api.publishPondChange();
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(2);
  expect(failure).not.toHaveBeenCalled();
});

it("tells connections to reconnect when the Redis subscription fails", async () => {
  const failure = jest.fn();
  releases.push(await api.subscribePondChanges(jest.fn(), failure));
  const { clients } = jest.requireMock("ioredis") as { clients: EventEmitter[] };
  clients.at(-1)!.emit("error", new Error("Connection lost"));
  expect(failure).toHaveBeenCalledTimes(1);
});

it("requires shared services on Vercel instead of silently splitting the pond", () => {
  process.env.VERCEL = "1";
  expect(() => api.requireRealtimeConfiguration()).toThrow("requires MongoDB");
  process.env.MONGODB_URI = "mongodb://test-only";
  expect(() => api.requireRealtimeConfiguration()).not.toThrow();
  delete process.env.FROGCHAT_REDIS_URL;
  expect(() => api.requireRealtimeConfiguration()).toThrow("Redis");
});

it("routes invalidations only to the affected pond using one shared subscriber", async () => {
  const classic = jest.fn(); const woods = jest.fn(); const pixel = jest.fn();
  const { clients } = jest.requireMock("ioredis") as { clients: EventEmitter[] };
  const before = clients.length;
  releases.push(await api.subscribePondChanges(classic, jest.fn()));
  releases.push(await api.subscribePondChanges(woods, jest.fn(), "woodland"));
  releases.push(await api.subscribePondChanges(pixel, jest.fn(), "pixel"));
  expect(clients.length - before).toBe(1);
  await api.publishPondChange("woodland");
  expect(woods).toHaveBeenCalledTimes(1);
  expect(classic).not.toHaveBeenCalled();
  expect(pixel).not.toHaveBeenCalled();
  await api.publishPondChange();
  expect(classic).toHaveBeenCalledTimes(1);
  expect(woods).toHaveBeenCalledTimes(1);
});
