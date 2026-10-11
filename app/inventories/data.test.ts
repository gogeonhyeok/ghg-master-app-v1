/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("mongodb", () => ({ ...jest.requireActual("mongodb"), MongoClient: jest.fn() }));

import { Binary, MongoClient, ObjectId } from "mongodb";
import { getInventories, getInventoryPhoto, INVENTORIES_COLLECTION, INVENTORIES_DATABASE } from "./data";

const mongoGlobal = globalThis as typeof globalThis & { inventoriesMongo?: Promise<MongoClient> };
const originalUri = process.env.MONGODB_URI;
const originalUrl = process.env.MONGODB_URL;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.MONGODB_URI = "mongodb://localhost/test";
});

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
        hasPhoto: true,
      },
      { _id: "record-2", name: null, description: {}, createdDate: "invalid", hasPhoto: false },
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
  expect(find.mock.calls[0][1].projection).not.toHaveProperty("photo");
  expect(cursor.limit).toHaveBeenCalledWith(100);
  expect(result[0]).toEqual({
    id: "record-1",
    name: "Camera",
    description: "Studio kit",
    createdDate: "2026-10-04T01:00:00.000Z",
    updatedDate: "2026-10-04T02:00:00.000Z",
    photo: "/inventories/record-1/photo",
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

test.each([
  [{ photo: new Binary(new Uint8Array([0, 128, 255])), photoContentType: "image/jpeg" }, [0, 128, 255], "image/jpeg"],
  [{ photo: "data:image/png;base64,aGVsbG8=" }, [104, 101, 108, 108, 111], "image/png"],
])("reads binary and legacy photos without corrupting bytes", async (document, bytes, contentType) => {
  const findOne = jest.fn().mockResolvedValue(document);
  mongoGlobal.inventoriesMongo = Promise.resolve({ db: () => ({ collection: () => ({ findOne }) }) } as never);
  const id = "507f1f77bcf86cd799439011";
  const result = await getInventoryPhoto(id);
  expect(Array.from(result!.bytes)).toEqual(bytes);
  expect(result!.contentType).toBe(contentType);
  expect(findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) }, expect.objectContaining({ projection: { photo: 1, photoContentType: 1 } }));
});

test("invalid image IDs do not query MongoDB", async () => {
  expect(await getInventoryPhoto("invalid")).toBeNull();
  expect(MongoClient).not.toHaveBeenCalled();
});

test.each([
  null,
  { photo: null },
  { photo: "javascript:alert(1)" },
  { photo: new Binary(new Uint8Array([1])), photoContentType: "text/html" },
  { photo: new Binary(new Uint8Array([])), photoContentType: "image/png" },
  { photo: new Binary(new Uint8Array(2 * 1024 * 1024 + 1)), photoContentType: "image/png" },
])("does not serve missing or invalid photos", async (document) => {
  mongoGlobal.inventoriesMongo = Promise.resolve({ db: () => ({ collection: () => ({ findOne: async () => document }) }) } as never);
  expect(await getInventoryPhoto("507f1f77bcf86cd799439011")).toBeNull();
});

test("fails before connecting when MongoDB is not configured", async () => {
  delete process.env.MONGODB_URI;
  delete process.env.MONGODB_URL;
  await expect(getInventories()).rejects.toThrow("MongoDB server configuration is missing.");
  expect(MongoClient).not.toHaveBeenCalled();
});
