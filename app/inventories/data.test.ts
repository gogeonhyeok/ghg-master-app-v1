/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("mongodb", () => ({ MongoClient: jest.fn() }));

import { MongoClient } from "mongodb";
import { getInventories, INVENTORIES_COLLECTION, INVENTORIES_DATABASE } from "./data";

const mongoGlobal = globalThis as typeof globalThis & { inventoriesMongo?: Promise<MongoClient> };
const originalUri = process.env.MONGODB_URI;
const originalUrl = process.env.MONGODB_URL;

beforeEach(() => jest.clearAllMocks());

afterEach(() => {
  delete mongoGlobal.inventoriesMongo;
  if (originalUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = originalUri;
  if (originalUrl === undefined) delete process.env.MONGODB_URL;
  else process.env.MONGODB_URL = originalUrl;
  jest.restoreAllMocks();
});

test("reads the ghg-master-api-v1 inventories collection and normalizes records", async () => {
  process.env.MONGODB_URI = "mongodb://localhost/test";
  const cursor = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maxTimeMS: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([
      {
        _id: "record-1",
        name: "Camera",
        description: "Studio kit",
        createdDate: new Date("2026-10-04T01:00:00.000Z"),
        updatedDate: "2026-10-04T02:00:00.000Z",
        photo: "data:image/png;base64,aGVsbG8=",
      },
      { _id: "record-2", name: null, description: {}, createdDate: "invalid", photo: "javascript:alert(1)" },
    ]),
  };
  const find = jest.fn().mockReturnValue(cursor);
  const collection = jest.fn().mockReturnValue({ find });
  const db = jest.fn().mockReturnValue({ collection });
  const client = { connect: jest.fn(), close: jest.fn(), db };
  client.connect.mockResolvedValue(client);
  jest.mocked(MongoClient).mockImplementation(() => client as unknown as MongoClient);

  const result = await getInventories();

  expect(db).toHaveBeenCalledWith(INVENTORIES_DATABASE);
  expect(INVENTORIES_DATABASE).toBe("ghg-master-api-v1");
  expect(collection).toHaveBeenCalledWith(INVENTORIES_COLLECTION);
  expect(INVENTORIES_COLLECTION).toBe("inventories");
  expect(find).toHaveBeenCalledWith({}, expect.objectContaining({ projection: expect.any(Object) }));
  expect(cursor.limit).toHaveBeenCalledWith(100);
  expect(result[0]).toEqual({
    id: "record-1",
    name: "Camera",
    description: "Studio kit",
    createdDate: "2026-10-04T01:00:00.000Z",
    updatedDate: "2026-10-04T02:00:00.000Z",
    photo: "data:image/png;base64,aGVsbG8=",
  });
  expect(result[1]).toEqual(expect.objectContaining({
    name: "Unnamed inventory",
    description: "",
    createdDate: "",
    photo: "",
  }));

  await getInventories();
  expect(client.connect).toHaveBeenCalledTimes(1);
});

test("fails before connecting when MongoDB is not configured", async () => {
  delete process.env.MONGODB_URI;
  delete process.env.MONGODB_URL;
  await expect(getInventories()).rejects.toThrow("MongoDB server configuration is missing.");
  expect(MongoClient).not.toHaveBeenCalled();
});
