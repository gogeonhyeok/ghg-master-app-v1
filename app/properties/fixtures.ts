import { providers, type PropertyPage, type Provider } from "./catalog";

// Synthetic responses shared by tests; no tests contact the Lambda or public providers.
export function propertyFixture(): PropertyPage {
  const ids: Provider[] = ["hdb", "korea", "taiwan"];
  return {
    page: 1, size: 20, total: 3, returned: 3, paginationScope: "per-source", currencyConversionApplied: false,
    sources: ids.map((id) => ({ id, country: providers[id].code, currency: providers[id].currency,
      source: "Synthetic fixture", coverage: "Fixture coverage", total: 1, returned: 1, status: 200 })),
    items: ids.map((provider, index) => ({ provider, country: providers[provider].code, currency: providers[provider].currency,
      type: "residential", price: [650000, 850000000, 25000000][index], date: provider === "hdb" ? "2026-10" : "2026-10-03",
      address: ["123 ANG MO KIO AVE 3", "서울특별시 종로구 테스트", "臺北市信義路"][index],
      sourceData: [{ floor_area_sqm: "90" }, { area_m2: 84.85 }, { "建物移轉總面積平方公尺": "100.5" }][index] })),
  };
}
