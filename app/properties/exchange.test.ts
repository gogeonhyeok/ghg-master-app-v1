/** @jest-environment node */
import { afterEach, expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
jest.mock("server-only", () => ({}));

import { exchangeEndpoint, getUsdRates, parseUsdRates } from "./exchange";
import { propertyFixture, usdFixture } from "./fixtures";
import { orderByUsd, priceInUsd } from "./usd";

const payload = () => Object.entries(usdFixture).map(([quote, { localPerUsd, date }]) => ({ base: "USD", quote, rate: localPerUsd, date }));
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test("converts local amounts by dividing by the USD base rate, preserving original values", () => {
  const items = propertyFixture().items;
  expect(items.map((item) => priceInUsd(item, usdFixture))).toEqual([520000, 425000, 500000]);
  expect(items.map(({ price }) => price)).toEqual([650000, 850000000, 25000000]);
  expect(priceInUsd({ ...items[0], price: 0 }, usdFixture)).toBe(0);
  expect(priceInUsd(items[0], null)).toBeNull();
  expect(priceInUsd({ ...items[0], currency: "EUR" }, usdFixture)).toBeNull();
});

test("sorts all currencies by unrounded USD values without mutating source order", () => {
  const items = propertyFixture().items;
  expect(orderByUsd(items, usdFixture, "usd-asc").map(({ provider }) => provider)).toEqual(["korea", "taiwan", "hdb"]);
  expect(orderByUsd(items, usdFixture, "usd-desc").map(({ provider }) => provider)).toEqual(["hdb", "taiwan", "korea"]);
  expect(orderByUsd(items, usdFixture, "source")).toBe(items);
  expect(orderByUsd(items, null, "usd-asc")).toBe(items);
  const closePrices = [{ ...items[0], price: 1.004 * usdFixture.SGD.localPerUsd }, { ...items[1], price: 1.003 * usdFixture.KRW.localPerUsd }];
  expect(orderByUsd(closePrices, usdFixture, "usd-asc")[0].provider).toBe("korea");
  expect(items.map(({ provider }) => provider)).toEqual(["hdb", "korea", "taiwan"]);
});

test("requires a complete set of finite positive USD rates with valid dates", () => {
  expect(parseUsdRates(payload())).toEqual(usdFixture);
  for (const invalid of [null, {}, payload().slice(1), [payload()[0], payload()[0], payload()[2]],
    ...[0, -1, Infinity, NaN, "1.25"].map((rate) => [{ ...payload()[0], rate }, ...payload().slice(1)]),
    ...["2026-02-30", "bad date"].map((date) => [{ ...payload()[0], date }, ...payload().slice(1)]),
    [{ ...payload()[0], base: "EUR" }, ...payload().slice(1)]]) {
    expect(() => parseUsdRates(invalid)).toThrow();
  }
});

test("fetches all three rates in one server request with hourly caching and a timeout", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(payload())));
  await expect(getUsdRates()).resolves.toEqual(usdFixture);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(exchangeEndpoint, expect.objectContaining({
    next: { revalidate: 3600 }, headers: { Accept: "application/json" }, signal: expect.any(AbortSignal),
  }));
});

test("does not invent USD prices when the rate service fails or returns incomplete data", async () => {
  for (const response of [new Response("unavailable", { status: 503 }), new Response("bad JSON"), new Response(JSON.stringify(payload().slice(1)))]) {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue(response);
    await expect(getUsdRates()).resolves.toBeNull();
  }
  global.fetch = jest.fn<typeof fetch>().mockRejectedValue(new DOMException("Timed out", "TimeoutError"));
  await expect(getUsdRates()).resolves.toBeNull();
});
