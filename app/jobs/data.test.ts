/** @jest-environment node */
import { afterEach, expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
jest.mock("server-only", () => ({}));

import { getSingaporeJobs, normalizeJobs } from "./data";
import { employers, filterJobs, jobsUrl, parseFilters, type Job } from "./catalog";

const posting = {
  id: 42, title: "Senior Software Engineer", location: { name: "Singapore" },
  absolute_url: "https://stripe.com/jobs/search?gh_jid=42", first_published: "2026-10-10T00:00:00Z", updated_at: "2026-10-12T00:00:00Z",
};
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.restoreAllMocks(); });

test("only includes Singapore IT jobs, preserves multi-location roles, and deduplicates", () => {
  const result = normalizeJobs({ jobs: [posting, posting,
    { ...posting, id: 43, title: "Account Executive" },
    { ...posting, id: 44, location: { name: "Remote, worldwide" } },
    { ...posting, id: 45, location: { name: "New York" } },
    { ...posting, id: 46, title: "Solutions Architect", location: { name: "Singapore; Sydney" } },
    { ...posting, id: 47, title: "Data Engineer" },
    { ...posting, id: 48, title: "Cloud Security Engineer" },
    { ...posting, id: 49, title: "Global Safety & Security Manager" },
    { ...posting, id: 50, title: "Technical Recruiter" },
    { ...posting, id: 51, title: "Director, Sales Engineering - ASEAN" },
    null, { id: 52 },
  ] }, employers[0]);
  expect(result.map(({ id }) => id)).toEqual(["stripe-42", "stripe-46", "stripe-47", "stripe-48", "stripe-51"]);
  expect(result.map(({ discipline }) => discipline)).toEqual(["software", "solutions", "data", "platform", "solutions"]);
  expect(result[0]).toMatchObject({ dateLabel: "Posted", date: "2026-10-10T00:00:00.000Z" });
});

test("rejects unsafe links and expired postings; labels fallback dates accurately", () => {
  const result = normalizeJobs({ jobs: [
    { ...posting, id: 1, absolute_url: "javascript:alert(1)" },
    { ...posting, id: 2, absolute_url: "http://example.com" },
    { ...posting, id: 3, absolute_url: "https://user:password@example.com" },
    { ...posting, id: 4, application_deadline: "2000-01-01T00:00:00Z" },
    { ...posting, id: 5, first_published: "invalid" },
    { ...posting, id: 6, first_published: null, updated_at: null },
  ] }, employers[0]);
  expect(result.map(({ id }) => id)).toEqual(["stripe-5", "stripe-6"]);
  expect(result[0]).toMatchObject({ dateLabel: "Updated", date: "2026-10-12T00:00:00.000Z" });
  expect(result[1].date).toBeNull();
  expect(() => normalizeJobs({}, employers[0])).toThrow("Invalid job feed");
});

test("keeps successful feeds when other feeds fail or return malformed JSON", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ jobs: [posting] }))
    .mockRejectedValueOnce(new Error("Timeout"))
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValueOnce(Response.json({ unexpected: true }));
  const result = await getSingaporeJobs();
  expect(result.jobs).toHaveLength(1);
  expect(result.sources.map(({ available }) => available)).toEqual([true, false, false, false]);
  expect(global.fetch).toHaveBeenCalledTimes(4);
  expect(jest.mocked(global.fetch).mock.calls[0][0]).toBe("https://boards-api.greenhouse.io/v1/boards/stripe/jobs");
});

test("reports a total outage without synthetic jobs", async () => {
  global.fetch = jest.fn<typeof fetch>().mockRejectedValue(new Error("Offline"));
  const result = await getSingaporeJobs();
  expect(result.jobs).toEqual([]);
  expect(result.sources.every(({ available }) => !available)).toBe(true);
});

test("searches all fetched jobs before paginating, sorts, and clamps out-of-range pages", () => {
  const jobs: Job[] = Array.from({ length: 26 }, (_, i) => ({
    ...normalizeJobs({ jobs: [posting] }, employers[0])[0], id: String(i),
    company: i === 25 ? "Datadog" : "Stripe", employer: i === 25 ? "datadog" : "stripe",
    title: i === 25 ? "Python Software Engineer" : "Software Engineer", date: `2026-10-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
  }));
  expect(filterJobs(jobs, parseFilters({ q: " python DATADOG " })).jobs.map(({ id }) => id)).toEqual(["25"]);
  const last = filterJobs(jobs, parseFilters({ page: "999999" }));
  expect(last).toMatchObject({ page: 3, pages: 3, total: 26 });
  expect(last.jobs).toHaveLength(2);
  expect(filterJobs(jobs, parseFilters({ employer: "datadog", discipline: "data" })).total).toBe(0);
  expect(filterJobs(jobs, parseFilters({ sort: "company" })).jobs[0].company).toBe("Datadog");
});

test.each(["-1", "0", "1.5", "1e3", "1000000", ["2"], undefined])("normalizes invalid page %s", (page) => {
  expect(parseFilters({ page }).page).toBe(1);
});

test("normalizes repeated and unknown filters and preserves safe query parameters in pagination", () => {
  expect(parseFilters({ q: ["a", "b"], employer: "__proto__", discipline: "unknown", sort: "invalid" })).toMatchObject({ q: "", employer: "", discipline: "", sort: "newest" });
  const filters = parseFilters({ q: " C++ & cloud ", employer: "stripe", discipline: "platform", sort: "company" });
  const url = new URL(jobsUrl(filters, 2), "https://example.com");
  expect(Object.fromEntries(url.searchParams)).toEqual({ q: "C++ & cloud", employer: "stripe", discipline: "platform", sort: "company", page: "2" });
});
