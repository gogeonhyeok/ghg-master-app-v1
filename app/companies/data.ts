import "server-only";
import type { CompaniesPage, Company } from "./catalog";
import { normalizeSearch } from "../_lib/singapore-directory";

export const companiesEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/companies";

function parseCompany(value: unknown): Company {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid company record");
  const row = value as Record<string, unknown>;
  for (const key of ["uen", "name", "status", "entityType"]) {
    if (typeof row[key] !== "string" || !(row[key] as string).trim()) throw new Error("Invalid company record");
  }
  for (const key of ["registrationDate", "streetName", "postalCode"]) {
    if (row[key] !== null && typeof row[key] !== "string") throw new Error("Invalid company record");
  }
  return {
    uen: row.uen as string, name: row.name as string, status: row.status as string, entityType: row.entityType as string,
    registrationDate: row.registrationDate as string | null, streetName: row.streetName as string | null,
    postalCode: row.postalCode as string | null,
  };
}

export async function getCompanies(page = 1, size = 25, entityName = ""): Promise<CompaniesPage> {
  const search = normalizeSearch(entityName);
  const url = new URL(companiesEndpoint);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (search) url.searchParams.set("entity_name", search);
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error("Company data is unavailable.");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid companies response");
  const data = payload as Record<string, unknown>;
  if (data.page !== page || data.size !== size || !Number.isSafeInteger(data.total) || (data.total as number) < 0 ||
      !Array.isArray(data.companies) || data.companies.length > size ||
      data.companies.length > Math.max(0, (data.total as number) - (page - 1) * size)) {
    throw new Error("Invalid companies response");
  }
  const companies = data.companies.map(parseCompany);
  if (new Set(companies.map((company) => company.uen)).size !== companies.length) throw new Error("Duplicate company records");
  return { page, size, total: data.total as number, companies };
}
