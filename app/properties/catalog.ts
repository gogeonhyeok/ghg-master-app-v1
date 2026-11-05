export type PropertiesQuery = Record<string, string | string[] | undefined>;
export type PropertyFilters = { month: string; town: string; koreaQuery: string; city: string; page: number; size: number };
export const providers = {
  hdb: { name: "Singapore", code: "SG", currency: "SGD", type: "HDB resale", href: "https://data.gov.sg/datasets/d_8b84c4ee58e3cfc0ece0d773c8ca6abc/view" },
  korea: { name: "South Korea", code: "KR", currency: "KRW", type: "Apartment sales", href: "https://realestate-api.goyostudio.io" },
  taiwan: { name: "Taiwan", code: "TW", currency: "TWD", type: "Residential sales", href: "https://data.gov.tw/dataset/77051" },
} as const;
export type Provider = keyof typeof providers;
export const cities = [
  ["A", "Taipei"], ["F", "New Taipei"], ["B", "Taichung"], ["D", "Tainan"], ["E", "Kaohsiung"],
  ["H", "Taoyuan"], ["C", "Keelung"], ["G", "Yilan County"], ["I", "Chiayi City"],
  ["J", "Hsinchu County"], ["K", "Miaoli County"], ["M", "Nantou County"], ["N", "Changhua County"],
  ["O", "Hsinchu City"], ["P", "Yunlin County"], ["Q", "Chiayi County"], ["T", "Pingtung County"],
  ["U", "Hualien County"], ["V", "Taitung County"], ["W", "Kinmen County"], ["X", "Penghu County"], ["Z", "Lienchiang County"],
] as const;

export type PropertySource = {
  id: Provider; country: string; currency: string; source: string; coverage: string;
  total: number; returned: number; status: number; available?: number; truncated?: boolean;
  resolvedLocation?: string; resolvedNote?: string; missingMonths?: string[];
};
export type PropertyTransaction = {
  provider: Provider; country: string; currency: string; type: string;
  price: number; date: string; address: string; sourceData: Record<string, unknown>;
};
export type PropertyPage = {
  page: number; size: number; total: number; returned: number; paginationScope: "per-source";
  currencyConversionApplied: false; sources: PropertySource[]; items: PropertyTransaction[];
};

export function previousMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit" }).formatToParts(now);
  const year = Number(parts.find(({ type }) => type === "year")?.value);
  const month = Number(parts.find(({ type }) => type === "month")?.value);
  return new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
}

export function parseFilters(query: PropertiesQuery, now = new Date()): { filters: PropertyFilters; error?: string } {
  const value = (key: string, fallback: string) => typeof query[key] === "string" ? query[key].trim() : fallback;
  const filters: PropertyFilters = {
    month: value("month", previousMonth(now)), town: value("town", "").toUpperCase(),
    koreaQuery: value("koreaQuery", "서울특별시 종로구"), city: value("city", "A").toUpperCase(),
    page: Number(value("page", "1")), size: Number(value("size", "20")),
  };
  let error: string | undefined;
  if (["month", "town", "koreaQuery", "city", "page", "size"].some((key) => Array.isArray(query[key]))) error = "Use one value per filter.";
  else if (!/^[12]\d{3}-(0[1-9]|1[0-2])$/.test(filters.month)) error = "Choose a month in YYYY-MM format.";
  else if (!Number.isInteger(filters.page) || filters.page < 1 || filters.page > 500) error = "Choose a page between 1 and 500.";
  else if (!Number.isInteger(filters.size) || filters.size < 1 || filters.size > 100) error = "Choose 1 to 100 records per source.";
  else if (filters.town.length > 100) error = "Use a shorter HDB town name.";
  else if (!filters.koreaQuery || Buffer.byteLength(filters.koreaQuery, "utf8") > 90 || filters.koreaQuery.split(/\s+/).length > 8) error = "Enter a shorter Korean location, such as a district or neighbourhood.";
  else if (!cities.some(([code]) => code === filters.city)) error = "Choose a supported Taiwan city or county.";
  return { filters, error };
}

export function propertiesUrl(filters: PropertyFilters, page = filters.page) {
  const params = new URLSearchParams({ month: filters.month, koreaQuery: filters.koreaQuery, city: filters.city, size: String(filters.size), page: String(page) });
  if (filters.town) params.set("town", filters.town);
  return `/properties?${params}`;
}

export function availablePages(data: PropertyPage) {
  return Math.max(1, ...data.sources.map((source) => Math.min(500, Math.ceil(
    (source.id === "korea" ? Math.min(source.total, source.available ?? 500) : source.total) / data.size,
  ))));
}

export function formatPrice(item: PropertyTransaction) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: item.currency, currencyDisplay: "code", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(item.price);
}

export function propertyArea(item: PropertyTransaction) {
  const raw = item.sourceData.floor_area_sqm ?? item.sourceData.area_m2 ?? item.sourceData["建物移轉總面積平方公尺"];
  if (raw === null || raw === undefined || raw === "") return "—";
  const area = Number(raw);
  return Number.isFinite(area) && area > 0 ? `${new Intl.NumberFormat("en-SG", { maximumFractionDigits: 2 }).format(area)} m²` : "—";
}
