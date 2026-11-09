import { directoryUrl, parseDirectoryQuery } from "../_lib/singapore-directory";
export { maxPage } from "../_lib/singapore-directory";

export type CompaniesQuery = { page?: string | string[]; size?: string | string[]; entity_name?: string | string[] };
export type Company = {
  uen: string;
  name: string;
  status: string;
  entityType: string;
  registrationDate: string | null;
  streetName: string | null;
  postalCode: string | null;
};
export type CompaniesPage = { page: number; size: number; total: number; companies: Company[] };
export function parseCompaniesQuery(query: CompaniesQuery) {
  const { search, ...pagination } = parseDirectoryQuery(query.page, query.size, query.entity_name);
  return { ...pagination, entityName: search };
}

export function companiesUrl(page: number, size: number, entityName = "") {
  return directoryUrl("/companies", page, size, "entity_name", entityName);
}

export function formatRegistrationDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "—";
  return new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}
