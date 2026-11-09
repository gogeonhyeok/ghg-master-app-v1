import "server-only";
import { filterKeys, parseHospitalQuery, sourceUrl, type Hospital, type HospitalFilters, type HospitalsPage } from "./catalog";

export const hospitalEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/hospital";

function parseHospital(value: unknown): Hospital {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid hospital record");
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !/^[a-z0-9-]+$/.test(row.id) ||
      typeof row.name !== "string" || !row.name.trim() || typeof row.address !== "string" || !row.address.trim() ||
      row.sourceUrl !== `https://www.sgdi.gov.sg/ministries/moh/others/${row.id}`) throw new Error("Invalid hospital details");
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
      !source || source.provider !== "Singapore Government Directory" ||
      source.url !== sourceUrl || typeof source.retrievedAt !== "string" ||
      !Number.isFinite(Date.parse(source.retrievedAt))) {
    throw new Error("Invalid hospital response");
  }
  const hospitals = data.hospitals.map(parseHospital);
  if (new Set(hospitals.map(row => row.id)).size !== hospitals.length) throw new Error("Duplicate hospital features");
  return { page, size, total: data.total as number, coverage: data.coverage,
    source: source as HospitalsPage["source"], hospitals };
}
