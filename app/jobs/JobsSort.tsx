"use client";

import type { JobsFilters } from "./catalog";
import styles from "./page.module.css";

export default function JobsSort({ filters }: { filters: JobsFilters }) {
  return (
    <form action="/jobs" method="get" className={styles.sort} aria-label="Sort jobs">
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="discipline" value={filters.discipline} />
      <input type="hidden" name="employer" value={filters.employer} />
      <label htmlFor="jobs-sort">Sort by</label>
      <select id="jobs-sort" name="sort" defaultValue={filters.sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        <option value="newest">Newest first</option>
        <option value="company">Company A–Z</option>
      </select>
      <noscript><button type="submit">Apply</button></noscript>
    </form>
  );
}
