import "server-only";
import { attribution, filterKeys, licenseUrl, parseHospitalQuery, sourceUrl, type Hospital, type HospitalFilters, type HospitalsPage } from "./catalog";

export const hospitalEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/hospital";

function parseHospital(value: unknown): Hospital {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid hospital record");
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !/^(node|way|relation)\/[1-9]\d*$/.test(row.id) ||
      row.osmUrl !== `https://www.openstreetmap.org/${row.id}`) throw new Error("Invalid hospital identity");
  for (const key of ["name", "operator", "speciality", "address", "houseNumber", "street", "postalCode", "city",
    "emergency", "wheelchair", "phone", "website", "openingHours"]) {
    if (row[key] !== null && typeof row[key] !== "string") throw new Error("Invalid hospital details");
  }
  for (const [key, bound] of [["latitude", 90], ["longitude", 180]] as const) {
    if (typeof row[key] !== "number" || !Number.isFinite(row[key]) || Math.abs(row[key] as number) > bound) {
      throw new Error("Invalid hospital coordinates");
    }
  }
  return row as Hospital;
}

export async function getHospitals(page = 1, size = 25, filters: Partial<HospitalFilters> = {}): Promise<HospitalsPage> {
  const parsed = parseHospitalQuery(filters);
  if (parsed.invalidFields.length || !Number.isInteger(page) || page < 1 || page > 1_000_000 ||
      !Number.isInteger(size) || size < 1 || size > 100) throw new Error("Invalid hospital search");
  const url = new URL(process.env.SINGAPORE_HOSPITAL_API_URL || hospitalEndpoint);
  url.search = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  for (const key of filterKeys) if (parsed.filters[key]) url.searchParams.set(key, parsed.filters[key]);
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error("Hospital data is unavailable.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid hospital response");
  const data = payload as Record<string, unknown>;
  const source = data.source as Record<string, unknown> | null;
  if (data.page !== page || data.size !== size || !Number.isSafeInteger(data.total) || (data.total as number) < 0 ||
      !Array.isArray(data.hospitals) || data.hospitals.length > size ||
      data.hospitals.length > Math.max(0, (data.total as number) - (page - 1) * size) ||
      typeof data.coverage !== "string" || !data.coverage.trim() ||
      !source || source.provider !== "OpenStreetMap via Overpass" || source.url !== sourceUrl ||
      source.attribution !== attribution || source.license !== "ODbL-1.0" || source.licenseUrl !== licenseUrl ||
      typeof source.dataTimestamp !== "string" || !Number.isFinite(Date.parse(source.dataTimestamp))) {
    throw new Error("Invalid hospital response");
  }
  const hospitals = data.hospitals.map(parseHospital);
  if (new Set(hospitals.map(row => row.id)).size !== hospitals.length) throw new Error("Duplicate hospital features");
  return { page, size, total: data.total as number, coverage: data.coverage,
    source: source as HospitalsPage["source"], hospitals };
}
