import { directoryUrl, maxSearchLength, parseDirectoryQuery, type QueryValue } from "../_lib/singapore-directory";
export { maxPage } from "../_lib/singapore-directory";

export const filterKeys = ["q", "name", "operator", "speciality", "street", "postal_code", "emergency", "wheelchair"] as const;
export type HospitalFilterKey = typeof filterKeys[number];
export type HospitalFilters = Record<HospitalFilterKey, string>;
export type HospitalQuery = Partial<Record<HospitalFilterKey | "page" | "size", QueryValue>>;
export const sourceUrl = "https://overpass.private.coffee/api/interpreter";
export const licenseUrl = "https://opendatacommons.org/licenses/odbl/1-0/";
export const attribution = "© OpenStreetMap contributors";
export const coverage = "Community-maintained hospital map features in Singapore. This is not an official licensed-hospital directory; records may be incomplete or include multiple features for one hospital.";

export type Hospital = {
  id: string; name: string | null; operator: string | null; speciality: string | null;
  address: string | null; houseNumber: string | null; street: string | null; postalCode: string | null; city: string | null;
  latitude: number; longitude: number; emergency: string | null; wheelchair: string | null;
  phone: string | null; website: string | null; openingHours: string | null; osmUrl: string;
};
export type HospitalsPage = {
  page: number; size: number; total: number; coverage: string; hospitals: Hospital[];
  source: { provider: string; url: string; attribution: string; license: string; licenseUrl: string; dataTimestamp: string };
};

export function parseHospitalQuery(query: HospitalQuery = {}) {
  const { page, size } = parseDirectoryQuery(query.page, query.size, undefined);
  const filters = {} as HospitalFilters;
  const invalidFields: HospitalFilterKey[] = [];
  for (const key of filterKeys) {
    const value = query[key];
    filters[key] = typeof value === "string" ? value.trim() : "";
    if (Array.isArray(value) || filters[key].length > maxSearchLength ||
        (key === "emergency" && !["", "yes", "no"].includes(filters[key])) ||
        (key === "wheelchair" && !["", "yes", "no", "limited"].includes(filters[key]))) invalidFields.push(key);
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

export function phoneUrl(value: string | null) {
  if (!value || !/^\+?[\d ()-]+$/.test(value)) return null;
  const number = value.replace(/[ ()-]/g, "");
  return /\d/.test(number) ? `tel:${number}` : null;
}
