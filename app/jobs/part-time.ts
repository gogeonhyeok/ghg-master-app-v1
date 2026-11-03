import { jobsUrl, type JobsFilters, type JobsQuery } from "./catalog";

export type PartTimeJob = {
  id: string;
  title: string;
  company: string;
  url: string;
  excerpt: string;
  categories: string[];
  eligibility: string;
  salary: string | null;
  updatedAt: string | null;
};

export type PartTimeFeed = { jobs: PartTimeJob[]; available: boolean; page: number; hasNext: boolean };

export function parsePartTimePage(query: JobsQuery): number {
  return typeof query.partTimePage === "string" && /^[1-9]\d{0,5}$/.test(query.partTimePage) ? Number(query.partTimePage) : 1;
}

export function partTimeUrl(filters: JobsFilters, page: number): string {
  const url = new URL(jobsUrl(filters), "https://example.com");
  if (page > 1) url.searchParams.set("partTimePage", String(page));
  return `${url.pathname}${url.search}#part-time-heading`;
}
