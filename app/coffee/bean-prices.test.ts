/** @jest-environment node */
import { beanCatalog, normalizeBean, pricePer100g } from "./bean-prices";
import { fetchBeanPrices } from "./bean-prices.server";
import { emptyTracker, readTracker, recordBeanPrices } from "./bean-history";
import { GET } from "../api/coffee/bean-prices/route";

const checkedAt = "2026-11-03T10:00:00.000Z";
const variant = { id: 101, option1: "1kg", option2: "Whole Beans", price: "76.00", grams: 1100, available: true };
const originalFetch = global.fetch;

afterEach(() => { global.fetch = originalFetch; });

test("uses coffee weight rather than shipping weight and excludes ground, corporate and invalid variants", () => {
  const listing = normalizeBean(beanCatalog[0], { variants: [variant,
    { ...variant, id: 102, option2: "Ground for Espresso" },
    { ...variant, id: 103, option2: "Whole Beans (Corporate)" },
    { ...variant, id: 104, option1: "2 bags" },
    { ...variant, id: 105, price: "NaN" },
    { ...variant, id: 106, price: "0.00" },
  ] }, checkedAt);
  expect(listing.variants).toEqual([{ id: "101", label: "1kg", grams: 1000, priceCents: 7600, available: true }]);
  expect(pricePer100g(listing.variants[0])).toBe(7.6);
});

function mockFeeds({ pppUnavailable = false, pppCurrency = "SGD" } = {}) {
  const mock = jest.fn(async (url: string) => {
    const ppp = url.startsWith("https://pppcoffee.com/");
    return {
      ok: !(ppp && pppUnavailable),
      headers: new Headers({ date: "Tue, 03 Nov 2026 10:00:00 GMT" }),
      json: async () => url.includes("cart.js") ? { currency: ppp ? pppCurrency : "SGD" } : {
        products: beanCatalog.filter((bean) => bean.retailerId === (ppp ? "ppp" : "common-man"))
          .map((bean) => ({ handle: bean.handle, variants: [variant] })),
      },
    } as Response;
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

test("loads each retailer once plus its currency check and keeps the source observation time", async () => {
  const fetch = mockFeeds();
  const response = await fetchBeanPrices();
  expect(fetch).toHaveBeenCalledTimes(4);
  expect(response.listings).toHaveLength(5);
  expect(response.listings.every((listing) => listing.checkedAt === checkedAt && listing.variants.length === 1)).toBe(true);
});

test("a rate-limited retailer does not hide prices from the other retailer", async () => {
  mockFeeds({ pppUnavailable: true });
  const { listings } = await fetchBeanPrices();
  expect(listings.filter((listing) => listing.retailerId === "ppp").every((listing) => listing.checkedAt === null && !listing.variants.length)).toBe(true);
  expect(listings.filter((listing) => listing.retailerId === "common-man").every((listing) => listing.variants.length === 1)).toBe(true);
});

test("never labels an unverified foreign-currency price as SGD", async () => {
  mockFeeds({ pppCurrency: "USD" });
  const { listings } = await fetchBeanPrices();
  expect(listings.filter((listing) => listing.retailerId === "ppp").every((listing) => !listing.variants.length)).toBe(true);
});

test("the public endpoint exposes the normalized feed without browser caching", async () => {
  mockFeeds();
  const response = await GET();
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toMatchObject({ currency: "SGD", cacheSeconds: 3600, listings: expect.any(Array) });
});

test("history separates pack variants, ignores cached or older snapshots and records new observations", () => {
  const listing = normalizeBean(beanCatalog[0], { variants: [variant, { ...variant, id: 102, option1: "250g", price: "24.00" }] }, checkedAt);
  const state = recordBeanPrices(emptyTracker(), [listing]);
  expect(recordBeanPrices(state, [listing])).toEqual(state);
  const next = recordBeanPrices(state, [{ ...listing, checkedAt: "2026-11-04T10:00:00.000Z", variants: [{ ...listing.variants[0], priceCents: 2200 }] }]);
  expect(next.history[`${listing.id}:102`].map((point) => point.priceCents)).toEqual([2400, 2200]);
  expect(next.history[`${listing.id}:101`].map((point) => point.priceCents)).toEqual([7600]);
  expect(recordBeanPrices(next, [listing])).toEqual(next);
});

test("recovers from invalid browser storage without using invalid observations", () => {
  expect(readTracker("not-json")).toEqual(emptyTracker());
  expect(readTracker(JSON.stringify({ watched: ["bean", 12], history: { bean: [{ at: "bad-date", priceCents: 2000 }] } }))).toEqual({ watched: ["bean"], history: { bean: [] } });
});
