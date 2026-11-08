/** @jest-environment node */
jest.mock("server-only", () => ({}));

import { defaultEndpoint, getWarehouseInventories, getWarehouseMasterData, getWarehouseOrders } from "./data";
import { isMasterKind, parsePage } from "./catalog";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalEndpoint = process.env.WAREHOUSE_API_URL;

beforeEach(() => {
  global.fetch = fetchMock;
  fetchMock.mockReset();
  delete process.env.WAREHOUSE_API_URL;
});
afterAll(() => {
  global.fetch = originalFetch;
  if (originalEndpoint === undefined) delete process.env.WAREHOUSE_API_URL;
  else process.env.WAREHOUSE_API_URL = originalEndpoint;
});

function respond(body: unknown, ok = true) {
  fetchMock.mockResolvedValue({ ok, json: async () => body });
}

test("reads inventory display rows from Camel without a MongoDB dependency", async () => {
  const body = { rows: [{ id: "1", cells: { qty: "200.25", skuQty: "0", productName: "Processor", locationNo: "A-01" } }], total: 1, page: 1, pageSize: 50 };
  respond(body);
  await expect(getWarehouseInventories()).resolves.toEqual(body);
  expect(fetchMock).toHaveBeenCalledWith(`${defaultEndpoint}/inventories?page=1`, expect.objectContaining({ cache: "no-store", headers: { Accept: "application/json" } }));
});

test("uses an override URL and accepts server-clamped pagination", async () => {
  process.env.WAREHOUSE_API_URL = "http://localhost:8080/warehouse/";
  const body = { rows: [{ id: "order-26", cells: { isUrgent: "Yes", collectBillAmount: "0" } }], total: 26, page: 2, pageSize: 25 };
  respond(body);
  await expect(getWarehouseOrders(999)).resolves.toEqual(body);
  expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/warehouse/orders?page=999");
});

test.each(["products", "locations", "centers", "skus"] as const)("reads %s from the master data endpoint", async (kind) => {
  respond({ rows: [], total: 0, page: 1, pageSize: 25 });
  await expect(getWarehouseMasterData(kind, 5)).resolves.toMatchObject({ rows: [], total: 0, page: 1 });
  expect(fetchMock.mock.calls[0][0]).toBe(`${defaultEndpoint}/master-data/${kind}?page=5`);
});

test("propagates service errors for the page's unavailable state", async () => {
  respond({ error: "unavailable" }, false);
  await expect(getWarehouseOrders()).rejects.toThrow("Warehouse data is unavailable.");
  fetchMock.mockRejectedValue(new Error("Connection failed"));
  await expect(getWarehouseInventories()).rejects.toThrow("Connection failed");
});

test.each([
  null, [], { rows: [], total: -1, page: 1, pageSize: 25 },
  { rows: [], total: 0, page: 2, pageSize: 25 },
  { rows: [], total: 0, page: 1, pageSize: 50 },
  { rows: [{ id: "1", cells: { qty: 5 } }], total: 1, page: 1, pageSize: 25 },
  { rows: [{ id: 1, cells: {} }], total: 1, page: 1, pageSize: 25 },
])("rejects malformed API payload %j", async (payload) => {
  respond(payload);
  await expect(getWarehouseOrders()).rejects.toThrow("Invalid warehouse");
});

test.each([undefined, "0", "-1", "abc", "1.5", "1e3", "9007199254740992", ["2"]])("defaults invalid page %s", (value) => {
  expect(parsePage(value)).toBe(1);
});

test("accepts valid pages and only known master collections", async () => {
  expect(parsePage("2")).toBe(2);
  expect(isMasterKind("locations")).toBe(true);
  expect(isMasterKind("__proto__")).toBe(false);
  expect(isMasterKind("unrecognized")).toBe(false);
  await expect(getWarehouseMasterData("__proto__" as never)).rejects.toThrow("Unknown warehouse");
  expect(fetchMock).not.toHaveBeenCalled();
});
