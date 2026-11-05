import "server-only";
import { providers, type PropertyFilters, type PropertyPage, type PropertySource, type PropertyTransaction, type Provider } from "./catalog";

export const defaultEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/properties";
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const count = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isProvider = (value: unknown): value is Provider => typeof value === "string" && Object.hasOwn(providers, value);

export function parsePropertyPage(payload: unknown, filters: PropertyFilters): PropertyPage {
  const data = object(payload);
  if (data.page !== filters.page || data.size !== filters.size || data.paginationScope !== "per-source" || data.currencyConversionApplied !== false ||
      !count(data.total) || !count(data.returned) || !Array.isArray(data.sources) || !Array.isArray(data.items) || data.sources.length !== 3) throw new Error("Invalid property response");
  const sources = data.sources.map((entry): PropertySource => {
    const source = object(entry);
    if (!isProvider(source.id) || source.country !== providers[source.id].code || source.currency !== providers[source.id].currency ||
        typeof source.source !== "string" || typeof source.coverage !== "string" || source.status !== 200 ||
        !count(source.total) || !count(source.returned) || source.returned > filters.size || source.returned > source.total ||
        (source.available !== undefined && !count(source.available)) ||
        (source.truncated !== undefined && typeof source.truncated !== "boolean") ||
        (source.missingMonths !== undefined && (!Array.isArray(source.missingMonths) || !source.missingMonths.every((month) => typeof month === "string")))) throw new Error("Invalid property source");
    return { ...source, resolvedLocation: typeof source.resolvedLocation === "string" ? source.resolvedLocation : undefined,
      resolvedNote: typeof source.resolvedNote === "string" ? source.resolvedNote : undefined } as PropertySource;
  });
  if (new Set(sources.map(({ id }) => id)).size !== 3) throw new Error("Duplicate property source");
  const items = data.items.map((entry): PropertyTransaction => {
    const row = object(entry);
    if (!isProvider(row.provider) || row.country !== providers[row.provider].code || row.currency !== providers[row.provider].currency ||
        typeof row.price !== "number" || !Number.isFinite(row.price) || row.price < 0 || typeof row.address !== "string" ||
        typeof row.date !== "string" || !/^\d{4}-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.test(row.date) || !row.date.startsWith(filters.month) || typeof row.type !== "string") throw new Error("Invalid property transaction");
    return { ...row, sourceData: object(row.sourceData) } as PropertyTransaction;
  });
  if (items.length !== data.returned || sources.reduce((sum, source) => sum + source.total, 0) !== data.total ||
      sources.some((source) => items.filter(({ provider }) => provider === source.id).length !== source.returned)) throw new Error("Inconsistent property totals");
  return { ...data, sources, items } as PropertyPage;
}

export async function getProperties(filters: PropertyFilters): Promise<{ available: true; data: PropertyPage } | { available: false }> {
  try {
    const url = new URL(process.env.PROPERTIES_API_URL || defaultEndpoint);
    url.search = new URLSearchParams({ month: filters.month, town: filters.town, koreaQuery: filters.koreaQuery, city: filters.city, page: String(filters.page), size: String(filters.size) }).toString();
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(35000) });
    if (!response.ok) return { available: false };
    return { available: true, data: parsePropertyPage(await response.json(), filters) };
  } catch {
    return { available: false };
  }
}
