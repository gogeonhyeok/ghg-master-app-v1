import type { Metadata } from "next";
import Link from "next/link";
import { filterJobs, jobsUrl, pageSize, parseFilters, type JobsQuery } from "./catalog";
import { getSingaporeJobs } from "./data";
import JobsResults from "./JobsResults";
import JobsSort from "./JobsSort";
import JobsFilters from "./JobsFilters";
import JobsPagination from "./JobsPagination";
import JobBoards from "./JobBoards";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Singapore IT Jobs | Go Gun Hyuk",
  description: "Find Singapore software engineering, data, cloud, security, and IT opportunities from selected employers’ public job boards.",
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<JobsQuery> }) {
  const filters = parseFilters(await searchParams);
  const { jobs, sources } = await getSingaporeJobs();
  const result = filterJobs(jobs, filters);
  const available = sources.filter((source) => source.available);
  const failed = sources.filter((source) => !source.available);
  const first = result.total ? (result.page - 1) * pageSize + 1 : 0;

  return (
    <div className={styles.page}>
      <main>
        <nav aria-label="Breadcrumb">
          <Link href="/">← Workspace</Link>
          <span>/</span>
          <span>Jobs</span>
          <span>01° N / SINGAPORE</span>
        </nav>

        <section aria-labelledby="jobs-heading">
          <header>
            <div>
              <h1 id="jobs-heading">Singapore IT jobs</h1>
              <p>Selected employer listings · Updated every 15 minutes</p>
            </div>
            <a href={jobsUrl(filters)}>Reload listings ↻</a>
          </header>
          <JobsFilters key={jobsUrl(filters)} filters={filters} />

          {failed.length > 0 && (
            <aside role="status">
              <strong>{available.length ? "Some employer feeds are unavailable." : "Job listings are temporarily unavailable."}</strong>
              <p>{available.length ? `Results may be incomplete. Could not load ${failed.map(({ name }) => name).join(", ")}.` : "Please try again shortly, or explore the Singapore job boards below."}</p>
              <a href={jobsUrl(filters)}>Try again ↗</a>
            </aside>
          )}

          {available.length > 0 && (
            <>
              <header aria-label="Job results">
                <div>
                  <p>{result.total ? <>Showing {first}–{Math.min(first + pageSize - 1, result.total)} of <strong>{result.total}</strong> matching roles</> : "0 matching roles"}</p>
                  <small>{available.length} / {sources.length} employer feeds available</small>
                </div>
                <JobsSort key={jobsUrl(filters)} filters={filters} />
              </header>
              {result.jobs.length ? (
                <JobsResults jobs={result.jobs} />
              ) : (
                <article>
                  <span aria-hidden="true">↗</span>
                  <h3>No roles found this time.</h3>
                  <p>Try another title or broaden your filters. Only Singapore locations and IT-related job titles are included.</p>
                  <Link href="/jobs">Clear all filters →</Link>
                </article>
              )}
              <JobsPagination filters={filters} page={result.page} pages={result.pages} />
            </>
          )}

          <footer>
            <details>
              <summary>Coverage & matching</summary>
              <p>Coverage: {sources.map(({ name }) => name).join(", ")}. Roles are matched by job title and must explicitly list Singapore as a location. Multi-location roles may include other cities. This is a selection of opportunities, not the entire market.</p>
            </details>
          </footer>
        </section>

        <JobBoards />

        <footer>
          <p>Go Gun Hyuk <span>/</span> Singapore IT jobs</p>
          <a href="https://docs.greenhouse.io/job-board" target="_blank" rel="noopener noreferrer">Job data via Greenhouse’s public API ↗</a>
        </footer>
      </main>
    </div>
  );
}
