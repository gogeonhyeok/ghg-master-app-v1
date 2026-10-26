/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import type { Db } from "mongodb";

jest.mock("server-only", () => ({}));
import { actInPond, leavePond, readPond, speakInPond } from "./store";

// Driver 5 returns ModifyResult wrappers even when no document was matched.
const frog = {
  _id: "private-key", id: "frog-one", pond: "woodland", name: "Sunny Moss",
  color: "#87b966", joinedAt: Date.now(), x: 50, facing: 1, jumpedAt: 0,
  lastSpokeAt: new Date(0), expiresAt: new Date(Date.now() + 90_000),
};
const update = jest.fn<(...args: unknown[]) => Promise<{ value: typeof frog | null }>>();
const remove = jest.fn<(...args: unknown[]) => Promise<{ value: typeof frog | null }>>();
const insert = jest.fn();
const collection = {
  findOneAndUpdate: update, findOneAndDelete: remove, insertOne: insert,
  findOne: jest.fn<() => Promise<null>>().mockResolvedValue(null),
  find: () => ({ sort() { return this; }, limit() { return this; }, async toArray() { return []; } }),
};
const shared = globalThis as typeof globalThis & { frogchatDatabase?: Promise<Db> };
const previousUri = process.env.MONGODB_URI;
const previousDatabase = shared.frogchatDatabase;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.MONGODB_URI = "mongodb://unused-test-double";
  shared.frogchatDatabase = Promise.resolve({ collection: () => collection } as unknown as Db);
});
afterEach(() => {
  shared.frogchatDatabase = previousDatabase;
  if (previousUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = previousUri;
});

it("unwraps authenticated residents and rejects a wrapped missing session", async () => {
  update.mockResolvedValueOnce({ value: frog });
  expect((await readPond("token")).pond).toBe("woodland");
  update.mockResolvedValueOnce({ value: null });
  await expect(readPond("expired-token")).rejects.toMatchObject({ status: 401 });
});

it.each([{ type: "move", direction: 1 } as const, { type: "jump" } as const])("checks the wrapped atomic claim for $type", async action => {
  update.mockResolvedValueOnce({ value: frog }).mockResolvedValueOnce({ value: null });
  expect(await actInPond("token", action)).toBeNull();
  update.mockResolvedValueOnce({ value: frog }).mockResolvedValueOnce({ value: frog });
  expect(await actInPond("token", action)).toBe("woodland");
  expect(update).toHaveBeenLastCalledWith(
    expect.objectContaining({ _id: frog._id }),
    { $set: expect.objectContaining(action.type === "move" ? { x: 52.5, facing: 1 } : { jumpedAt: expect.any(Number) }) },
  );
});

it("does not save messages when the wrapped rate-limit claim fails", async () => {
  update.mockResolvedValueOnce({ value: frog }).mockResolvedValueOnce({ value: null });
  await expect(speakInPond("token", "Too soon", "one")).rejects.toMatchObject({ status: 429 });
  expect(insert).not.toHaveBeenCalled();
});

it("unwraps deleted residents to broadcast departure to their room", async () => {
  remove.mockResolvedValueOnce({ value: frog });
  expect(await leavePond("token")).toBe("woodland");
  remove.mockResolvedValueOnce({ value: null });
  expect(await leavePond("already-gone")).toBe("classic");
});
