/** @jest-environment node */
import { afterEach, expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
jest.mock("server-only", () => ({}));

import { getPartTimeJobs, normalizePartTimeJobs } from "./himalayas";
import { parseFilters } from "./catalog";
import { parsePartTimePage, partTimeUrl } from "./part-time";

const now = Date.parse("2026-11-03T00:00:00Z");
const posting = {
  guid: "https://himalayas.app/companies/care/jobs/nurse", title: "Part Time Coordinating Nurse", companyName: "Care Team",
  applicationLink: "https://himalayas.app/companies/care/jobs/nurse?utm_source=api&ref=original",
  excerpt: "<p>Help patients &amp; families &#39;remotely&#39;.</p>", parentCategories: ["Healthcare"],
  employmentType: "Part Time", locationRestrictions: ["Singapore"], timezoneRestrictions: [8],
  pubDate: now / 1000 - 86400, expiryDate: now / 1000 + 86400,
  currency: "SGD", minSalary: 25, maxSalary: 35, salaryPeriod: "hourly",
};
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test("normalizes non-IT listings, preserves application links, deduplicates, and formats actual pay periods", () => {
  const jobs = normalizePartTimeJobs({ jobs: [posting, posting, null] }, now);
  expect(jobs).toHaveLength(1);
  expect(jobs[0]).toMatchObject({ title: posting.title, url: posting.applicationLink, excerpt: "Help patients & families 'remotely'.", categories: ["Healthcare"], updatedAt: "2026-11-02T00:00:00.000Z" });
  expect(jobs[0].salary?.replace(/\s/g, " ")).toBe("SGD 25–SGD 35 / hour");
});

test.each([
  { locationRestrictions: [], timezoneRestrictions: [] },
  { locationRestrictions: ["Singapore"], timezoneRestrictions: [8] },
  { locationRestrictions: [{ alpha2: "SG", name: "Singapore" }], timezoneRestrictions: ["UTC+8"] },
  { locationRestrictions: [{ name: "Singapore" }], timezoneRestrictions: ["UTC+08:00"] },
  { locationRestrictions: ["SG", "United States"], timezoneRestrictions: ["8"] },
])("accepts Singapore-eligible and worldwide roles with compatible timezones: %j", (fields) => {
  expect(normalizePartTimeJobs({ jobs: [{ ...posting, ...fields }] }, now)).toHaveLength(1);
});

test.each([
  { employmentType: "Full Time" }, { employmentType: "Contractor" },
  { locationRestrictions: ["United States"] }, { locationRestrictions: [] , timezoneRestrictions: [-5] },
  { timezoneRestrictions: ["UTC+5:30"] }, { locationRestrictions: null }, { timezoneRestrictions: undefined },
  { expiryDate: now / 1000 }, { expiryDate: null }, { expiryDate: Infinity },
  { applicationLink: "javascript:alert(1)" }, { applicationLink: "http://example.com" },
  { applicationLink: "https://user:pass@example.com" }, { title: " " }, { companyName: null }, { guid: null },
])("excludes expired, ineligible, unsafe, or incomplete roles: %j", (fields) => {
  expect(normalizePartTimeJobs({ jobs: [{ ...posting, ...fields }] }, now)).toEqual([]);
});

test("rechecks expiration after reading cached data", () => {
  expect(normalizePartTimeJobs({ jobs: [posting] }, now)).toHaveLength(1);
  expect(normalizePartTimeJobs({ jobs: [posting] }, now + 86400000)).toEqual([]);
});

test.each([
  { currency: null }, { minSalary: -1, maxSalary: null }, { minSalary: 50, maxSalary: 20 },
  { salaryPeriod: "project" }, { salaryPeriod: "__proto__" }, { minSalary: NaN, maxSalary: Infinity },
])("omits invalid pay instead of inventing a rate: %j", (fields) => {
  expect(normalizePartTimeJobs({ jobs: [{ ...posting, ...fields }] }, now)[0].salary).toBeNull();
});

test("fetches all-industry Singapore part-time jobs without credentials and caches for a day", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(Response.json({ jobs: [{ ...posting, expiryDate: Date.now() / 1000 + 86400 }], totalCount: 0 }));
  const result = await getPartTimeJobs(2);
  const [input, options] = jest.mocked(global.fetch).mock.calls[0];
  const url = new URL(String(input));
  expect(url.origin + url.pathname).toBe("https://himalayas.app/jobs/api/search");
  expect(Object.fromEntries(url.searchParams)).toEqual({ country: "SG", employment_type: "Part Time", sort: "recent", page: "2" });
  expect(options).toMatchObject({ headers: { Accept: "application/json" }, next: { revalidate: 86400 } });
  expect(options?.signal).toBeInstanceOf(AbortSignal);
  // A short page and stale totalCount do not mean the search is exhausted.
  expect(result).toMatchObject({ available: true, page: 2, hasNext: true });
  expect(result.jobs).toHaveLength(1);
});

test("an empty successful page ends pagination", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(Response.json({ jobs: [], totalCount: 39 }));
  expect(await getPartTimeJobs(3)).toEqual({ available: true, jobs: [], page: 3, hasNext: false });
});

test.each([429, 503])("handles HTTP %s without substituting fake jobs", async (status) => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(new Response("", { status }));
  expect(await getPartTimeJobs()).toEqual({ available: false, jobs: [], page: 1, hasNext: false });
});

test("handles network failures and malformed responses", async () => {
  global.fetch = jest.fn<typeof fetch>().mockRejectedValueOnce(new Error("Timeout"))
    .mockResolvedValueOnce(new Response("invalid JSON"))
    .mockResolvedValueOnce(Response.json({ unexpected: true }));
  for (let i = 0; i < 3; i++) expect(await getPartTimeJobs()).toMatchObject({ available: false, jobs: [] });
  expect(() => normalizePartTimeJobs({})).toThrow("Invalid part-time feed");
});

test.each(["0", "-1", "1.5", "1e3", "1000000", ["2"], undefined])("normalizes invalid part-time page %j", (partTimePage) => {
  expect(parsePartTimePage({ partTimePage })).toBe(1);
});

test("part-time pagination preserves applied IT search and returns to its own section", () => {
  expect(parsePartTimePage({ partTimePage: "2" })).toBe(2);
  const filters = parseFilters({ q: "C++ & cloud", employer: "stripe", page: "3" });
  const url = new URL(partTimeUrl(filters, 2), "https://example.com");
  expect(Object.fromEntries(url.searchParams)).toEqual({ q: "C++ & cloud", employer: "stripe", page: "3", partTimePage: "2" });
  expect(url.hash).toBe("#part-time-heading");
  expect(partTimeUrl(parseFilters({}), 1)).toBe("/jobs#part-time-heading");
});
