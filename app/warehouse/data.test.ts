/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("../inventories/data", () => ({ getInventoriesDatabase: jest.fn() }));

import { Decimal128, type Db, type Document } from "mongodb";
import { getInventoriesDatabase } from "../inventories/data";
import { getWarehouseInventories, getWarehouseMasterData } from "./data";
import { isMasterKind, parsePage } from "./catalog";

function mockDatabase(records: Record<string, Document[]>, totals: Record<string, number> = {}, failures: string[] = []) {
  const calls: { collection: string; filter: Document; projection: Document; sort: unknown; skip: number; limit: number }[] = [];
  const collection = jest.fn((name: string) => ({
    countDocuments: jest.fn(async () => {
      if (failures.includes(name)) throw new Error("Database unavailable");
      return totals[name] ?? records[name]?.length ?? 0;
    }),
    find: jest.fn((filter: Document, options: { projection: Document }) => {
      const call = { collection: name, filter, projection: options.projection, sort: {}, skip: 0, limit: Infinity };
      calls.push(call);
      const cursor = {
        sort: jest.fn((value) => { call.sort = value; return cursor; }),
        skip: jest.fn((value) => { call.skip = value; return cursor; }),
        limit: jest.fn((value) => { call.limit = value; return cursor; }),
        maxTimeMS: jest.fn().mockReturnThis(),
        toArray: jest.fn(async () => {
          if (failures.includes(name)) throw new Error("Database unavailable");
          const rows = (records[name] || []).filter((row) => Object.entries(filter).every(([key, condition]) => condition.$in.includes(row[key])));
          return rows.slice(call.skip, call.skip + call.limit);
        }),
      };
      return cursor;
    }),
  }));
  jest.mocked(getInventoriesDatabase).mockResolvedValue({ collection } as unknown as Db);
  return { calls, collection };
}

beforeEach(() => jest.clearAllMocks());

test("reads WMS stock, resolves referenced names, and preserves zero and BSON quantities", async () => {
  const { calls, collection } = mockDatabase({
    wmsInventories: [{ _id: "stock-1", invenNo: "IV-1", productId: "P1", locationId: "L1", qty: Decimal128.fromString("200.25"), skuQty: 0, pwPlanQty: "0", piPlanQty: null, photo: "private payload" }],
    masterProducts: [{ _id: "product-1", productId: "P1", productName: "Processor" }],
    locations: [{ _id: "location-1", locationId: "L1", locationNo: "A-01" }],
  });
  const result = await getWarehouseInventories();
  expect(collection).toHaveBeenCalledWith("wmsInventories");
  expect(collection).not.toHaveBeenCalledWith("inventories");
  expect(result.rows[0].cells).toMatchObject({ qty: "200.25", skuQty: "0", pwPlanQty: "0", piPlanQty: "—", productId: "P1", productName: "Processor", locationNo: "A-01" });
  expect(result.rows[0].cells).not.toHaveProperty("photo");
  expect(calls[0]).toMatchObject({ limit: 50, skip: 0, sort: { createDate: -1, _id: -1 } });
  expect(calls[0].projection).not.toHaveProperty("photo");
  expect(calls.find((call) => call.collection === "masterProducts")?.filter).toEqual({ productId: { $in: ["P1"] } });
});

test("keeps inventory IDs readable if reference lookups fail", async () => {
  mockDatabase({ wmsInventories: [{ _id: "1", productId: "P1", locationId: "L1", qty: 0 }] }, {}, ["masterProducts", "locations"]);
  const result = await getWarehouseInventories();
  expect(result.rows[0].cells).toMatchObject({ productId: "P1", productName: "—", locationId: "L1", locationNo: "—", qty: "0" });
});

test.each([
  ["products", "masterProducts"], ["locations", "locations"], ["centers", "centers"], ["skus", "masterSkus"],
] as const)("reads %s from the verified collection and clamps pagination", async (kind, collectionName) => {
  const records = Array.from({ length: 26 }, (_, index) => ({ _id: String(index), productName: `Product ${index}`, skuDesc: "PALLET", secret: "not rendered" }));
  const { calls } = mockDatabase({ [collectionName]: records });
  const result = await getWarehouseMasterData(kind, 999);
  expect(result).toMatchObject({ page: 2, pageSize: 25, total: 26 });
  expect(result.rows).toHaveLength(1);
  expect(result.rows[0].id).toBe("25");
  expect(result.rows[0].cells).not.toHaveProperty("secret");
  expect(calls[0]).toMatchObject({ collection: collectionName, skip: 25, limit: 25 });
});

test("returns an empty first page for an empty collection", async () => {
  mockDatabase({});
  expect(await getWarehouseMasterData("products", 5)).toMatchObject({ rows: [], total: 0, page: 1 });
});

test("propagates inventory connection failures for the page's error state", async () => {
  jest.mocked(getInventoriesDatabase).mockRejectedValue(new Error("Configuration missing"));
  await expect(getWarehouseInventories()).rejects.toThrow("Configuration missing");
});

test.each([undefined, "0", "-1", "abc", "1.5", "1e3", "9007199254740992", ["2"]])("rejects invalid page %s", (value) => {
  expect(parsePage(value)).toBe(1);
});

test("accepts a valid page and only known master collections", () => {
  expect(parsePage("2")).toBe(2);
  expect(isMasterKind("locations")).toBe(true);
  expect(isMasterKind("__proto__")).toBe(false);
  expect(isMasterKind("unrecognized")).toBe(false);
});
