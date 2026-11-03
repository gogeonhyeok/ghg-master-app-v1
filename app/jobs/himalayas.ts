import "server-only";
import type { PartTimeFeed, PartTimeJob } from "./part-time";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  if (typeof value !== "string") return "";
  const entities: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code: string) => {
      if (!code.startsWith("#")) return entities[code.toLowerCase()] ?? entity;
      const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    }).replace(/\s+/g, " ").trim();
}

function timestamp(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  const date = new Date(value * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function isSingapore(value: unknown): boolean {
  if (typeof value === "string") return /^(singapore|sg)$/i.test(value.trim());
  const location = record(value);
  return (typeof location.alpha2 === "string" && location.alpha2.toUpperCase() === "SG")
    || (typeof location.name === "string" && /^singapore$/i.test(location.name));
}

function salary(row: Record<string, unknown>): string | null {
  const periods: Record<string, string> = { hourly: "hour", weekly: "week", fortnightly: "fortnight", monthly: "month", annual: "year" };
  const period = row.salaryPeriod === undefined ? "annual" : row.salaryPeriod;
  if (typeof row.currency !== "string" || !/^[A-Z]{3}$/.test(row.currency) || typeof period !== "string" || !Object.hasOwn(periods, period)) return null;
  const min = typeof row.minSalary === "number" && Number.isFinite(row.minSalary) && row.minSalary > 0 ? row.minSalary : null;
  const max = typeof row.maxSalary === "number" && Number.isFinite(row.maxSalary) && row.maxSalary > 0 ? row.maxSalary : null;
  if ((!min && !max) || (min && max && max < min)) return null;
  const format = new Intl.NumberFormat("en-SG", { style: "currency", currency: row.currency, currencyDisplay: "code", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const range = min && max ? (min === max ? format.format(min) : `${format.format(min)}–${format.format(max)}`)
    : min ? `From ${format.format(min)}` : `Up to ${format.format(max!)}`;
  return `${range} / ${periods[period]}`;
}

export function normalizePartTimeJobs(payload: unknown, now = Date.now()): PartTimeJob[] {
  const data = record(payload);
  if (!Array.isArray(data.jobs)) throw new Error("Invalid part-time feed");
  const seen = new Set<string>();
  return data.jobs.flatMap((entry): PartTimeJob[] => {
    const row = record(entry);
    const title = text(row.title);
    const company = text(row.companyName);
    const expiry = timestamp(row.expiryDate);
    if (!title || !company || typeof row.guid !== "string" || !row.guid.trim() || row.employmentType !== "Part Time"
      || !expiry || Date.parse(expiry) <= now || typeof row.applicationLink !== "string") return [];
    if (!Array.isArray(row.locationRestrictions) || !Array.isArray(row.timezoneRestrictions)) return [];
    const worldwide = row.locationRestrictions.length === 0;
    if (!worldwide && !row.locationRestrictions.some(isSingapore)) return [];
    if (row.timezoneRestrictions.length > 0 && !row.timezoneRestrictions.some((offset: unknown) =>
      offset === 8 || (typeof offset === "string" && /^(?:UTC)?\+?0?8(?::00)?$/i.test(offset.trim())))) return [];
    let url: URL;
    try { url = new URL(row.applicationLink); } catch { return []; }
    if (url.protocol !== "https:" || url.username || url.password || seen.has(row.guid)) return [];
    seen.add(row.guid);
    return [{
      id: row.guid, title, company,
      // Preserve the provider's application link, including its attribution parameters.
      url: row.applicationLink,
      excerpt: text(row.excerpt).slice(0, 360),
      categories: Array.isArray(row.parentCategories) ? row.parentCategories.map(text).filter(Boolean).slice(0, 3) : [],
      eligibility: worldwide ? "Worldwide · Singapore eligible" : "Open to applicants in Singapore",
      salary: salary(row), updatedAt: timestamp(row.pubDate),
    }];
  });
}

export async function getPartTimeJobs(page = 1): Promise<PartTimeFeed> {
  const requestedPage = Number.isSafeInteger(page) && page > 0 && page <= 999999 ? page : 1;
  try {
    const url = new URL("https://himalayas.app/jobs/api/search");
    url.search = new URLSearchParams({ country: "SG", employment_type: "Part Time", sort: "recent", page: String(requestedPage) }).toString();
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Part-time feed unavailable");
    const payload: unknown = await response.json();
    const jobs = normalizePartTimeJobs(payload);
    // Search pages can be short and totalCount is approximate. Continue until
    // a page has no raw jobs, as recommended by the provider.
    const rawJobs = record(payload).jobs as unknown[];
    return { jobs, available: true, page: requestedPage, hasNext: rawJobs.length > 0 && requestedPage < 999999 };
  } catch {
    return { jobs: [], available: false, page: requestedPage, hasNext: false };
  }
}
