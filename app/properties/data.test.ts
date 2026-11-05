/** @jest-environment node */
import { afterEach, expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
jest.mock("server-only", () => ({}));

import { availablePages, parseFilters, previousMonth, propertiesUrl } from "./catalog";
import { defaultEndpoint, getProperties, parsePropertyPage } from "./data";
import { propertyFixture } from "./fixtures";

const filters = parseFilters({ month: "2026-10" }).filters;
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test("defaults to the last completed Singapore month, including year and timezone boundaries", () => {
  expect(previousMonth(new Date("2026-10-31T16:00:00Z"))).toBe("2026-10");
  expect(previousMonth(new Date("2026-12-31T16:00:00Z"))).toBe("2026-12");
  expect(parseFilters({}, new Date("2026-11-05T00:00:00Z")).filters).toMatchObject({ month: "2026-10", page: 1, size: 20, city: "A" });
});

test.each([{ month: "2026-13" }, { page: "501" }, { size: "0" }, { size: "1.5" }, { city: "L" },
  { month: ["2026-10", "2026-11"] }, { koreaQuery: "" }, { koreaQuery: "한".repeat(31) }])("rejects unsupported filters before fetching: %j", (query) => {
  expect(parseFilters({ month: "2026-10", ...query }).error).toBeTruthy();
});

test("fetches only the configured Lambda with encoded, allowlisted query parameters", async () => {
  const selected = parseFilters({ month: "2026-10", town: "ang mo kio", koreaQuery: "서울 &limit=1", city: "a", url: "https://untrusted.example", country: "KR" }).filters;
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(propertyFixture())));
  await expect(getProperties(selected)).resolves.toMatchObject({ available: true });
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [input, options] = jest.mocked(global.fetch).mock.calls[0];
  const url = new URL(String(input));
  expect(url.origin + url.pathname).toBe(process.env.PROPERTIES_API_URL || defaultEndpoint);
  expect(Object.fromEntries(url.searchParams)).toEqual({ month: "2026-10", town: "ANG MO KIO", koreaQuery: "서울 &limit=1", city: "A", page: "1", size: "20" });
  expect(options).toMatchObject({ cache: "no-store", headers: { Accept: "application/json" }, signal: expect.any(AbortSignal) });
});

test("preserves native price amounts and rejects incomplete or inconsistent responses", () => {
  expect(parsePropertyPage(propertyFixture(), filters).items.map(({ price }) => price)).toEqual([650000, 850000000, 25000000]);
  const badCurrency = propertyFixture(); badCurrency.items[1].currency = "SGD";
  const badTotal = propertyFixture(); badTotal.returned = 50;
  const incomplete = propertyFixture(); incomplete.sources.pop();
  for (const payload of [{ error: "private upstream failure" }, badCurrency, badTotal, incomplete]) {
    expect(() => parsePropertyPage(payload, filters)).toThrow();
  }
});

test("bounds pagination by each source's accessible records, including Korea's cap", () => {
  const data = propertyFixture();
  data.sources[0].total = 41;
  data.sources[1] = { ...data.sources[1], total: 1000, available: 500, truncated: true };
  expect(availablePages(data)).toBe(25);
  const url = new URL(propertiesUrl({ ...filters, town: "ANG MO KIO", koreaQuery: "서울특별시 강남구", city: "F" }, 2), "http://localhost");
  expect(url.searchParams.get("town")).toBe("ANG MO KIO");
  expect(url.searchParams.get("koreaQuery")).toBe("서울특별시 강남구");
  expect(url.searchParams.get("city")).toBe("F");
  expect(url.searchParams.get("page")).toBe("2");
});

test("reports HTTP failures, malformed JSON, schema changes and timeouts as unavailable", async () => {
  for (const response of [new Response("private details", { status: 502 }), new Response("invalid JSON"), new Response("{}")]) {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue(response);
    await expect(getProperties(filters)).resolves.toEqual({ available: false });
  }
  global.fetch = jest.fn<typeof fetch>().mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
  await expect(getProperties(filters)).resolves.toEqual({ available: false });
});
