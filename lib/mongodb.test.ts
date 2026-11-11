/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("mongodb", () => ({ MongoClient: jest.fn() }));
import { MongoClient } from "mongodb";
import { getMongoClient } from "./mongodb";
const shared = globalThis as typeof globalThis & { appMongoClient?: Promise<MongoClient> };
const oldUri = process.env.MONGODB_URI;
const oldUrl = process.env.MONGODB_URL;
beforeEach(() => { jest.clearAllMocks(); delete shared.appMongoClient; process.env.MONGODB_URI = "mongodb://test-only"; });
afterEach(() => { delete shared.appMongoClient; if (oldUri === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = oldUri; if (oldUrl === undefined) delete process.env.MONGODB_URL; else process.env.MONGODB_URL = oldUrl; });

test("reuses one connection and retries a failed connection without leaking its URI", async () => {
  const client = { connect: jest.fn(), close: jest.fn().mockResolvedValue(undefined) };
  client.connect.mockRejectedValueOnce(new Error("private URI")).mockResolvedValue(client);
  jest.mocked(MongoClient).mockImplementation(() => client as never);
  await expect(getMongoClient()).rejects.toThrow("MongoDB connection unavailable.");
  expect(client.close).toHaveBeenCalledTimes(1);
  expect(await getMongoClient()).toBe(client);
  expect(await getMongoClient()).toBe(client);
  expect(MongoClient).toHaveBeenCalledTimes(2);
});

test("uses the existing MONGODB_URL fallback and requires configuration", async () => {
  delete process.env.MONGODB_URI;
  process.env.MONGODB_URL = "mongodb://fallback-test";
  const client = { connect: jest.fn(), close: jest.fn() };
  client.connect.mockResolvedValue(client);
  jest.mocked(MongoClient).mockImplementation(() => client as never);
  await getMongoClient();
  expect(MongoClient).toHaveBeenCalledWith("mongodb://fallback-test", expect.objectContaining({ serverSelectionTimeoutMS: 5000 }));
  delete shared.appMongoClient;
  delete process.env.MONGODB_URL;
  await expect(getMongoClient()).rejects.toThrow("configuration is missing");
});
