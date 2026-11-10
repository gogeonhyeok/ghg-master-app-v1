/** @jest-environment node */
import { listOrders, placeOrder } from "./actions";

const originalFetch = global.fetch;
const mockFetch = jest.fn();
const endpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/coffee/order";
const order = {
  id: "order-123", customerName: "Alex", items: [{ name: "Americano", quantity: 2 }],
  status: "pending", createdAt: "2026-11-10T12:00:00Z",
};

function form(name = " Alex ", quantity = "2") {
  const data = new FormData();
  data.set("customerName", name);
  data.set("quantity", quantity);
  data.set("menu", "Latte");
  return data;
}

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});
afterEach(() => { global.fetch = originalFetch; });

test("posts only the validated Lambda contract and returns its confirmation", async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true, id: "order-123", message: "Order received! Reference order-123." }) });
  expect(await placeOrder(form())).toEqual({ ok: true, message: "Order received! Reference order-123." });
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch).toHaveBeenCalledWith(endpoint, expect.objectContaining({
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ customerName: "Alex", quantity: 2 }), cache: "no-store", signal: expect.any(AbortSignal),
  }));
});

test.each([[" ", "1"], ["x".repeat(81), "1"], ["Alex", "0"], ["Alex", "11"], ["Alex", "1.5"], ["Alex", "invalid"]])(
  "rejects invalid order %s / %s before calling Lambda", async (name, quantity) => {
    expect((await placeOrder(form(name, quantity))).ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  },
);

test.each(["http", "network", "malformed", "unconfirmed"])("handles %s POST failures without retrying or exposing upstream details", async (failure) => {
  if (failure === "network") mockFetch.mockRejectedValue(new Error("private upstream details"));
  else mockFetch.mockResolvedValue({
    ok: failure !== "http",
    json: async () => {
      if (failure === "malformed") throw new Error("private upstream details");
      return { ok: false, message: "private upstream details" };
    },
  });
  const result = await placeOrder(form());
  expect(result.ok).toBe(false);
  expect(result.message).toContain("check with the host");
  expect(result.message).not.toContain("private");
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("gets an uncached page of received orders", async () => {
  const data = { orders: [order], total: 26, page: 2, size: 25 };
  mockFetch.mockResolvedValue({ ok: true, json: async () => data });
  expect(await listOrders(2)).toEqual({ ok: true, data });
  expect(mockFetch).toHaveBeenCalledWith(`${endpoint}?page=2&size=25`, expect.objectContaining({
    method: "GET", cache: "no-store", signal: expect.any(AbortSignal),
  }));
});

test.each([[0, 25], [1000001, 25], [1.5, 25], [1, 0], [1, 101]])("rejects invalid pagination %s / %s", async (page, size) => {
  expect((await listOrders(page, size)).ok).toBe(false);
  expect(mockFetch).not.toHaveBeenCalled();
});

test("accepts an empty list", async () => {
  const data = { orders: [], total: 0, page: 1, size: 25 };
  mockFetch.mockResolvedValue({ ok: true, json: async () => data });
  expect(await listOrders()).toEqual({ ok: true, data });
});

test.each([
  null,
  { orders: [], total: 0, page: 2, size: 25 },
  { orders: [null], total: 1, page: 1, size: 25 },
  { orders: [{ ...order, createdAt: "invalid" }], total: 1, page: 1, size: 25 },
  { orders: [{ ...order, items: [{}] }], total: 1, page: 1, size: 25 },
])("rejects malformed list responses %#", async (data) => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => data });
  expect((await listOrders()).ok).toBe(false);
});

test("handles HTTP and network errors while listing orders", async () => {
  mockFetch.mockResolvedValueOnce({ ok: false });
  expect((await listOrders()).ok).toBe(false);
  mockFetch.mockRejectedValueOnce(new Error("network"));
  expect((await listOrders()).ok).toBe(false);
});
