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
