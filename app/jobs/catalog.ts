export const employers = [
  { token: "stripe", name: "Stripe", initials: "S", color: "#b9adff" },
  { token: "mongodb", name: "MongoDB", initials: "M", color: "#a6d9b1" },
  { token: "cloudflare", name: "Cloudflare", initials: "C", color: "#f4c38c" },
  { token: "datadog", name: "Datadog", initials: "D", color: "#d3b0ef" },
] as const;

export const disciplines = [
  { value: "software", label: "Software engineering", pattern: /\b(software|frontend|front.end|backend|back.end|full.stack|developer|engineering manager|engineer.*manager|engineering lead|head of engineering|director.*engineering)\b/i },
  { value: "data", label: "Data & AI", pattern: /\b(data|machine learning|artificial intelligence|AI|ML|analytics|scientist)\b/i },
  { value: "platform", label: "Cloud & security", pattern: /\b(cloud|devops|devsecops|SRE|site reliability|infrastructure|cyber.?security|information security|security (engineer|architect|analyst|researcher)|network|platform engineer|systems engineer)\b/i },
  { value: "solutions", label: "IT & solutions", pattern: /\b(IT|information technology|technical|solutions? (engineer(?:ing)?|architect)|sales engineer(?:ing)?|support engineer|systems? admin|technology)\b/i },
] as const;

export type Discipline = (typeof disciplines)[number]["value"];
export type Job = {
  id: string;
  title: string;
  company: string;
  employer: string;
  location: string;
  url: string;
  discipline: Discipline;
  date: string | null;
  dateLabel: "Posted" | "Updated";
};
export type JobsQuery = { [key: string]: string | string[] | undefined };
export type JobsFilters = { q: string; discipline: string; employer: string; sort: "newest" | "company"; page: number };
export const pageSize = 12;

export function classifyJob(title: string): Discipline | null {
  if (/\b(physical security|safety.*security|security.*safety|security officer|security guard|recruiter|recruiting|talent acquisition)\b/i.test(title)) return null;
  if (/\b(sales engineer(?:ing)?|solutions? (engineer(?:ing)?|architect))\b/i.test(title)) return "solutions";
  return disciplines.find(({ pattern }) => pattern.test(title))?.value ?? null;
}

export function parseFilters(query: JobsQuery): JobsFilters {
  const page = typeof query.page === "string" && /^[1-9]\d{0,5}$/.test(query.page) ? Number(query.page) : 1;
  return {
    q: typeof query.q === "string" ? query.q.trim().slice(0, 120) : "",
    discipline: disciplines.some(({ value }) => value === query.discipline) ? String(query.discipline) : "",
    employer: employers.some(({ token }) => token === query.employer) ? String(query.employer) : "",
    sort: query.sort === "company" ? "company" : "newest",
    page,
  };
}

export function jobsUrl(filters: JobsFilters, page = filters.page): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.discipline) params.set("discipline", filters.discipline);
  if (filters.employer) params.set("employer", filters.employer);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  return `/jobs${params.size ? `?${params}` : ""}`;
}

export function filterJobs(jobs: Job[], filters: JobsFilters) {
  const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
  const matching = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    return (!filters.discipline || job.discipline === filters.discipline)
      && (!filters.employer || job.employer === filters.employer)
      && terms.every((term) => text.includes(term));
  }).sort((a, b) => filters.sort === "company"
    ? a.company.localeCompare(b.company) || a.title.localeCompare(b.title)
    : (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0) || a.title.localeCompare(b.title));
  const pages = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(filters.page, pages);
  return { jobs: matching.slice((page - 1) * pageSize, page * pageSize), total: matching.length, pages, page };
}
