export const maxPage = 1_000_000;
export const maxSearchLength = 256;
export type QueryValue = string | string[] | undefined;

function boundedInteger(value: QueryValue, fallback: number, maximum: number) {
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) return fallback;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= maximum ? number : fallback;
}

export function parseDirectoryQuery(page: QueryValue, size: QueryValue, name: QueryValue) {
  const search = typeof name === "string" ? name.trim() : "";
  return {
    page: boundedInteger(page, 1, maxPage), size: boundedInteger(size, 25, 100), search,
    invalidSearch: Array.isArray(name) || search.length > maxSearchLength,
  };
}

export function directoryUrl(path: string, page: number, size: number, parameter: string, search = "") {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (search) params.set(parameter, search);
  return `${path}?${params}`;
}

export function normalizeSearch(value: string) {
  const search = value.trim();
  if (search.length > maxSearchLength) throw new Error("Search is too long.");
  return search;
}
