import "server-only";
import { classifyJob, employers, type Job } from "./catalog";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function validDate(value: unknown): string | null {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
}

export function normalizeJobs(payload: unknown, employer: (typeof employers)[number]): Job[] {
  const data = record(payload);
  if (!Array.isArray(data.jobs)) throw new Error("Invalid job feed");
  const seen = new Set<string>();
  return data.jobs.flatMap((entry): Job[] => {
    const row = record(entry);
    const location = record(row.location).name;
    if (typeof row.title !== "string" || !row.title.trim() || typeof location !== "string" || !/\bsingapore\b/i.test(location)) return [];
    const discipline = classifyJob(row.title);
    if (!discipline || (typeof row.id !== "number" && typeof row.id !== "string") || typeof row.absolute_url !== "string") return [];
    let url: URL;
    try { url = new URL(row.absolute_url); } catch { return []; }
    if (url.protocol !== "https:" || url.username || url.password) return [];
    // Past application deadlines should not appear as open jobs, even in a cached feed.
    const deadline = validDate(row.application_deadline);
    if (deadline && Date.parse(deadline) < Date.now()) return [];
    const id = `${employer.token}-${row.id}`;
    if (seen.has(id)) return [];
    seen.add(id);
    const published = validDate(row.first_published);
    return [{
      id, title: row.title.trim(), company: employer.name, employer: employer.token,
      location, url: url.toString(), discipline,
      date: published ?? validDate(row.updated_at), dateLabel: published ? "Posted" : "Updated",
    }];
  });
}

export async function getSingaporeJobs() {
  const results = await Promise.allSettled(employers.map(async (employer) => {
    const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${employer.token}/jobs`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Job feed unavailable");
    return normalizeJobs(await response.json(), employer);
  }));
  return {
    jobs: results.flatMap((result) => result.status === "fulfilled" ? result.value : []),
    sources: employers.map((employer, index) => ({ ...employer, available: results[index].status === "fulfilled" })),
  };
}
