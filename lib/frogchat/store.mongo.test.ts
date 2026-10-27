/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import type { Db } from "mongodb";

jest.mock("server-only", () => ({}));
import { joinPond, readPond, speakInPond } from "./store";
import { MESSAGE_LIFETIME_MS } from "./types";

type Message = { _id: string; pond?: string; sentAt: number; expiresAt: Date };
const messages = new Map<string, Message>();
const findOne = jest.fn(async ({ _id }: { _id: string }) => messages.get(_id) ?? null);
const insertOne = jest.fn(async (message: Message) => {
  messages.set(message._id, message);
  return { acknowledged: true, insertedId: message._id };
});
const cursor = {
  sort: jest.fn(), limit: jest.fn(),
  toArray: jest.fn(async () => [...messages.values()].reverse()),
};
const find = jest.fn<(filter: unknown) => typeof cursor>(() => cursor);
const collection = jest.fn((name: string) => {
  if (name !== "frogchat_messages") throw new Error("Residents belong in live state, not MongoDB");
  return { findOne, insertOne, find };
});
const shared = globalThis as typeof globalThis & { frogchatDatabase?: Promise<Db>; frogchatMemory?: unknown };
const keys = ["MONGODB_URI", "MONGODB_URL", "FROGCHAT_REDIS_URL", "REDIS_URL"] as const;
const previous = keys.map(key => process.env[key]);
const previousDatabase = shared.frogchatDatabase;
const previousMemory = shared.frogchatMemory;

beforeEach(() => {
  jest.clearAllMocks();
  messages.clear();
  keys.forEach(key => delete process.env[key]);
  process.env.MONGODB_URI = "mongodb://unused-test-double";
  shared.frogchatDatabase = Promise.resolve({ collection } as unknown as Db);
  delete shared.frogchatMemory;
  cursor.sort.mockReturnValue(cursor);
  cursor.limit.mockReturnValue(cursor);
});
afterEach(() => {
  shared.frogchatDatabase = previousDatabase;
  shared.frogchatMemory = previousMemory;
  keys.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key];
    else process.env[key] = previous[index];
  });
});

it("uses MongoDB message documents directly and deduplicates retried messages", async () => {
  const session = await joinPond();
  const snapshot = await speakInPond(session.token, "A stored croak", "one");
  expect(insertOne).toHaveBeenCalledTimes(1);
  const stored = insertOne.mock.calls[0][0];
  expect(stored).toMatchObject({ _id: `${session.selfId}:one`, pond: "classic" });
  expect(stored.expiresAt.getTime() - stored.sentAt).toBe(MESSAGE_LIFETIME_MS);
  expect(snapshot.messages).toEqual([expect.objectContaining({ id: stored._id, text: "A stored croak" })]);
  expect(snapshot.messages[0]).not.toHaveProperty("_id");
  expect(snapshot.messages[0]).not.toHaveProperty("expiresAt");
  expect((await speakInPond(session.token, "A stored croak", "one")).messages).toEqual(snapshot.messages);
  expect(findOne).toHaveBeenLastCalledWith({ _id: stored._id });
  expect(insertOne).toHaveBeenCalledTimes(1);
  await expect(speakInPond(session.token, "Too soon", "two")).rejects.toMatchObject({ status: 429 });
  expect(insertOne).toHaveBeenCalledTimes(1);
});

it("queries unexpired room history while retaining legacy messages in the original pond", async () => {
  const classic = await joinPond();
  await readPond(classic.token);
  expect(find).toHaveBeenLastCalledWith({
    $or: [{ pond: "classic" }, { pond: { $exists: false } }],
    expiresAt: { $gt: expect.any(Date) },
  });
  const woodland = await joinPond("woodland");
  await readPond(woodland.token);
  expect(find).toHaveBeenLastCalledWith({ pond: "woodland", expiresAt: { $gt: expect.any(Date) } });
  expect(cursor.sort).toHaveBeenLastCalledWith({ sentAt: -1, _id: -1 });
  expect(cursor.limit).toHaveBeenLastCalledWith(100);
});
