/** @jest-environment node */
import { getCoffeeMenus } from "./menu-actions";

const originalFetch = global.fetch;
const mockFetch = jest.fn();
const cafe = { slug: "test-cafe", name: "Test Cafe", city: null, country: "Singapore", url: "https://menumigo.com/test-cafe" };
const data = {
  cafes: [cafe], count: 1,
  items: [{ restaurant: cafe, name: "Latte", category: "Coffee", price: 5, currency: "SGD", isAvailable: true, description: null }],
  coverage: "A sample of published cafe menus.",
  source: { provider: "Menumigo", url: "https://menumigo.com", retrievedAt: "2026-11-10T14:00:00Z" },
};

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch;
});
afterEach(() => { global.fetch = originalFetch; });

test("loads and validates cafe menus from the supplied Lambda without caching", async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => data });
  expect(await getCoffeeMenus()).toEqual({ ok: true, data });
  expect(mockFetch).toHaveBeenCalledWith("https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/coffee/menu", expect.objectContaining({
    method: "GET", cache: "no-store", signal: expect.any(AbortSignal),
  }));
});

test("accepts an empty result", async () => {
  const empty = { ...data, items: [], cafes: [], count: 0 };
  mockFetch.mockResolvedValue({ ok: true, json: async () => empty });
  expect(await getCoffeeMenus()).toEqual({ ok: true, data: empty });
});

test.each([
  null,
  { ...data, items: [null] },
  { ...data, count: 2 },
  { ...data, items: [{ ...data.items[0], currency: "bad currency" }] },
  { ...data, cafes: [{ ...cafe, url: "javascript:alert(1)" }] },
  { ...data, source: { ...data.source, retrievedAt: "invalid" } },
])("handles malformed provider data %# without exposing it", async (response) => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => response });
  expect((await getCoffeeMenus()).ok).toBe(false);
});

test("handles Lambda errors and network failures", async () => {
  mockFetch.mockResolvedValueOnce({ ok: false });
  expect((await getCoffeeMenus()).ok).toBe(false);
  mockFetch.mockRejectedValueOnce(new Error("private upstream error"));
  const result = await getCoffeeMenus();
  expect(result).toEqual({ ok: false, message: "Couldn’t load coffee menus. Please refresh to try again." });
});
