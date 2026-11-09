import "server-only";
import { datasetId, datasetUrl, type HawkerCentre, type KopitiamPage } from "./catalog";
import { normalizeSearch } from "../_lib/singapore-directory";

export const kopitiamEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/kopitiam";

function parseCentre(value: unknown): HawkerCentre {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid hawker centre");
  const row = value as Record<string, unknown>;
  for (const key of ["id", "name", "address"]) {
    if (typeof row[key] !== "string" || !(row[key] as string).trim()) throw new Error("Invalid hawker centre");
  }
  if (row.type !== "hawker-centre") throw new Error("Invalid hawker centre");
  for (const key of ["description", "status", "photoUrl"]) {
    if (row[key] !== null && typeof row[key] !== "string") throw new Error("Invalid hawker centre");
  }
  for (const [key, bound] of [["latitude", 90], ["longitude", 180]] as const) {
    if (row[key] !== null && (typeof row[key] !== "number" || !Number.isFinite(row[key]) || Math.abs(row[key] as number) > bound)) {
      throw new Error("Invalid hawker centre coordinates");
    }
  }
  for (const key of ["foodStalls", "marketStalls"]) {
    if (row[key] !== null && (!Number.isSafeInteger(row[key]) || (row[key] as number) < 0)) throw new Error("Invalid stall count");
  }
  return {
    id: row.id as string, name: row.name as string, address: row.address as string, type: "hawker-centre",
    latitude: row.latitude as number | null, longitude: row.longitude as number | null,
    foodStalls: row.foodStalls as number | null, marketStalls: row.marketStalls as number | null,
    description: row.description as string | null, status: row.status as string | null, photoUrl: row.photoUrl as string | null,
  };
}

export async function getKopitiams(page = 1, size = 25, name = ""): Promise<KopitiamPage> {
  const search = normalizeSearch(name);
  const url = new URL(kopitiamEndpoint);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (search) url.searchParams.set("name", search);
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error("Hawker centre data is unavailable.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid hawker centre response");
  const data = payload as Record<string, unknown>;
  const source = data.source as Record<string, unknown> | null;
  if (data.page !== page || data.size !== size || !Number.isSafeInteger(data.total) || (data.total as number) < 0 ||
      !Array.isArray(data.kopitiams) || data.kopitiams.length > size ||
      data.kopitiams.length > Math.max(0, (data.total as number) - (page - 1) * size) ||
      typeof data.coverage !== "string" || !data.coverage.trim() ||
      !source || source.agency !== "NEA" || source.datasetId !== datasetId || source.url !== datasetUrl) {
    throw new Error("Invalid hawker centre response");
  }
  const kopitiams = data.kopitiams.map(parseCentre);
  if (new Set(kopitiams.map((centre) => centre.id)).size !== kopitiams.length) throw new Error("Duplicate hawker centres");
  return { page, size, total: data.total as number, coverage: data.coverage,
    source: { agency: "NEA", datasetId, url: datasetUrl }, kopitiams };
}
