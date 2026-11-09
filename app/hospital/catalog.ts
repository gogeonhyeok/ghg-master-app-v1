import { directoryUrl, maxSearchLength, parseDirectoryQuery, type QueryValue } from "../_lib/singapore-directory";
export { maxPage } from "../_lib/singapore-directory";

export const filterKeys = ["q", "name", "address"] as const;
export type HospitalFilterKey = typeof filterKeys[number];
export type HospitalFilters = Record<HospitalFilterKey, string>;
export type HospitalQuery = Partial<Record<HospitalFilterKey | "page" | "size", QueryValue>>;
export const sourceUrl = "https://www.sgdi.gov.sg/other-organisations/hospitals";
export const coverage = "Public hospital entries listed in the Singapore Government Directory. Some entries group hospitals together; private hospitals are excluded.";

export type Hospital = { id: string; name: string; address: string; sourceUrl: string };
export type HospitalsPage = {
  page: number; size: number; total: number; coverage: string; hospitals: Hospital[];
  source: { provider: string; url: string; retrievedAt: string };
};

export function parseHospitalQuery(query: HospitalQuery = {}) {
  const { page, size } = parseDirectoryQuery(query.page, query.size, undefined);
  const filters = {} as HospitalFilters;
  const invalidFields: HospitalFilterKey[] = [];
  for (const key of filterKeys) {
    const value = query[key];
    filters[key] = typeof value === "string" ? value.trim() : "";
    if (Array.isArray(value) || filters[key].length > maxSearchLength) invalidFields.push(key);
  }
  return { page, size, filters, invalidFields };
}

export function hospitalUrl(page: number, size: number, filters: Partial<HospitalFilters> = {}) {
  const allowed: Record<string, string> = {};
  for (const key of filterKeys) if (filters[key]) allowed[key] = filters[key]!;
  return directoryUrl("/hospital", page, size, "q", "", allowed);
}

export function websiteUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
