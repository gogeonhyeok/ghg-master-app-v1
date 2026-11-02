/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { EventEmitter } from "node:events";
import type WebSocket from "ws";

jest.mock("server-only", () => ({}));
jest.mock("./store", () => {
  const actual = jest.requireActual<typeof import("./store")>("./store");
  return { ...actual, readPond: jest.fn(actual.readPond), actInPond: jest.fn(actual.actInPond) };
});

import { publishPondChange } from "./realtime";
import { PRESENCE_MS, type PondServerEvent } from "./types";

const { acceptPondSocket } = jest.requireActual<typeof import("./socket")>("./socket");
const { actInPond, joinPond, leavePond, readPond, speakInPond } = jest.requireMock<typeof import("./store")>("./store");

class Socket extends EventEmitter {
  readyState = 1;
  bufferedAmount = 0;
  events: PondServerEvent[] = [];
  closeCode?: number;
  send(value: string) { this.events.push(JSON.parse(value)); }
  close(code: number) { this.closeCode = code; this.readyState = 3; this.emit("close"); }
  receive(value: unknown, binary = false) { this.emit("message", Buffer.from(JSON.stringify(value)), binary); }
  motion(id: string) { return this.events.filter(event => event.type === "motion" && event.frog.id === id).at(-1); }
  latest() { return this.events.filter(event => event.type === "snapshot").at(-1)?.snapshot; }
}
const keys = ["MONGODB_URI", "MONGODB_URL", "REDIS_URL", "FROGCHAT_REDIS_URL", "VERCEL"] as const;
const previous = keys.map(key => process.env[key]);
const shared = globalThis as typeof globalThis & { frogchatMemory?: unknown };
const sockets: Socket[] = [];
function open() {
  const socket = new Socket();
  sockets.push(socket);
  acceptPondSocket(socket as unknown as WebSocket);
  return socket;
}
async function flush() { for (let i = 0; i < 30; i++) await Promise.resolve(); }

beforeEach(() => {
  jest.clearAllMocks();
  keys.forEach(key => delete process.env[key]);
  delete shared.frogchatMemory;
  jest.useFakeTimers({ now: 100_000 });
});
afterEach(() => {
  sockets.splice(0).forEach(socket => socket.close(1000));
  jest.useRealTimers();
  keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
});

it("broadcasts saved croaks and departures to authenticated subscribers without exposing tokens", async () => {
  const first = await joinPond();
  const second = await joinPond();
  const a = open(); const b = open();
  a.receive({ type: "authenticate", token: first.token });
  b.receive({ type: "authenticate", token: second.token });
  await flush();
  expect(a.latest()?.frogs).toHaveLength(2);
  await speakInPond(first.token, "Hello from a socket pond", "one");
  await publishPondChange();
  await flush();
  expect(b.latest()?.messages[0].text).toBe("Hello from a socket pond");
  expect(JSON.stringify(b.events)).not.toContain(first.token);
  expect(JSON.stringify(b.events)).not.toContain(second.token);
  await leavePond(first.token);
  await publishPondChange();
  await flush();
  expect(a.closeCode).toBe(4401);
  expect(b.latest()?.frogs.map(frog => frog.id)).toEqual([second.selfId]);
});

it("keeps a session alive with heartbeats and reconciles expired residents", async () => {
  const active = await joinPond();
  const absent = await joinPond();
  const socket = open();
  socket.receive({ type: "authenticate", token: active.token });
  await flush();
  for (let i = 0; i < 4; i++) {
    jest.advanceTimersByTime(25_000);
    socket.receive({ type: "heartbeat" });
    await flush();
  }
  expect(socket.latest()?.frogs.map(frog => frog.id)).toEqual([active.selfId]);
  expect(socket.latest()?.frogs.some(frog => frog.id === absent.selfId)).toBe(false);
  expect(socket.readyState).toBe(1);
});

it("rejects expired sessions and connections that never authenticate", async () => {
  const session = await joinPond();
  await leavePond(session.token);
  const expired = open();
  expired.receive({ type: "authenticate", token: session.token });
  await flush();
  expect(expired.closeCode).toBe(4401);
  expect(expired.latest()).toBeUndefined();
  const anonymous = open();
  jest.advanceTimersByTime(10_001);
  expect(anonymous.closeCode).toBe(1008);
});

it("closes stale and invalid connections and releases subscriptions", async () => {
  const session = await joinPond();
  const socket = open();
  socket.receive({ type: "authenticate", token: session.token });
  await flush();
  const events = socket.events.length;
  jest.advanceTimersByTime(PRESENCE_MS);
  expect(socket.closeCode).toBe(1008);
  await publishPondChange();
  await flush();
  expect(socket.events).toHaveLength(events);
  const invalid = open();
  invalid.receive({ type: "heartbeat" });
  expect(invalid.closeCode).toBe(1008);
  const binary = open();
  binary.receive({}, true);
  expect(binary.closeCode).toBe(1008);
});

it("recovers messages missed during a disconnect using a fresh initial snapshot", async () => {
  const session = await joinPond();
  const first = open();
  first.receive({ type: "authenticate", token: session.token });
  await flush();
  first.close(1000);
  await speakInPond(session.token, "Saved while disconnected", "one");
  await publishPondChange();
  const recovered = open();
  recovered.receive({ type: "authenticate", token: session.token });
  await flush();
  expect(recovered.latest()?.messages[0].text).toBe("Saved while disconnected");
});

it("binds subscriptions to the token’s pond and ignores client-supplied room overrides", async () => {
  const woods = await joinPond("woodland");
  const pixel = await joinPond("pixel");
  const a = open(); const b = open();
  a.receive({ type: "authenticate", token: woods.token, pond: "pixel" });
  b.receive({ type: "authenticate", token: pixel.token });
  await flush();
  expect(a.latest()?.pond).toBe("woodland");
  expect(a.latest()?.frogs.map(frog => frog.id)).toEqual([woods.selfId]);
  const before = b.events.length;
  await speakInPond(woods.token, "A woodland secret", "one");
  await publishPondChange("woodland");
  await flush();
  expect(a.latest()?.messages[0].text).toBe("A woodland secret");
  expect(b.events).toHaveLength(before);
  b.receive({ type: "heartbeat" });
  await flush();
  expect(b.latest()?.messages).toEqual([]);
});

it("shares movement and jumps using the authenticated frog and rate limits repeated actions", async () => {
  const first = await joinPond(); const second = await joinPond();
  const a = open(); const b = open();
  a.receive({ type: "authenticate", token: first.token }); b.receive({ type: "authenticate", token: second.token });
  await flush();
  const otherX = b.latest()?.frogs.find(frog => frog.id === second.selfId)?.x;
  a.receive({ type: "move", seq: 1, direction: 1, frogId: second.selfId }); await flush();
  expect(b.motion(first.selfId)).toMatchObject({ frog: { x: 52.5, facing: 1 } });
  expect(b.latest()?.frogs.find(frog => frog.id === second.selfId)?.x).toBe(otherX);
  a.receive({ type: "move", seq: 2, direction: 1 }); await flush();
  expect(b.motion(first.selfId)).toMatchObject({ frog: { x: 52.5 } });
  a.receive({ type: "jump", seq: 3 }); await flush();
  expect(b.motion(first.selfId)).toMatchObject({ frog: { jumpedAt: Date.now() } });
  a.receive({ type: "move", seq: 4, direction: 500 }); await flush();
  expect(a.closeCode).toBe(1008);
});

it("queues inputs during a slow write and broadcasts deltas without reading room history", async () => {
  const first = await joinPond(); const second = await joinPond();
  const a = open(); const b = open();
  a.receive({ type: "authenticate", token: first.token }); b.receive({ type: "authenticate", token: second.token });
  await flush();
  const reads = jest.mocked(readPond).mock.calls.length;
  const actual = jest.requireActual<typeof import("./store")>("./store");
  let release!: () => void;
  const slow = new Promise<void>(resolve => { release = resolve; });
  jest.mocked(actInPond).mockImplementationOnce(async (...args) => { await slow; return actual.actInPond(...args); });
  a.receive({ type: "move", direction: 1, seq: 1 });
  jest.advanceTimersByTime(150);
  a.receive({ type: "move", direction: 1, seq: 2 });
  await flush();
  expect(a.events.filter(event => event.type === "ack")).toHaveLength(0);
  release(); await flush();
  expect(a.events.filter(event => event.type === "ack")).toMatchObject([
    { seq: 1, accepted: true, frog: { x: 52.5, motionVersion: 1 } },
    { seq: 2, accepted: true, frog: { x: 55, motionVersion: 2 } },
  ]);
  expect(b.motion(first.selfId)).toMatchObject({ frog: { x: 55, motionVersion: 2 } });
  expect(jest.mocked(readPond).mock.calls).toHaveLength(reads);
  expect(b.events.filter(event => event.type === "motion").every(event => !("snapshot" in event))).toBe(true);
  a.receive({ type: "move", direction: 1, seq: 2 });
  expect(a.closeCode).toBe(1008);
});
