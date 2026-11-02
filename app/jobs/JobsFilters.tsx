"use client";

import { useState } from "react";
import Link from "next/link";
import { disciplines, employers, type JobsFilters as Filters } from "./catalog";
import styles from "./page.module.css";

export default function JobsFilters({ filters }: { filters: Filters }) {
  const [expanded, setExpanded] = useState(false);
  const [discipline, setDiscipline] = useState(filters.discipline);
  const [employer, setEmployer] = useState(filters.employer);
  const activeCount = Number(Boolean(discipline)) + Number(Boolean(employer));

  return (
    <form action="/jobs" method="get" className={styles.filters} aria-label="Filter jobs" data-expanded={expanded}>
      <div>
        <label htmlFor="jobs-query">Search roles</label>
        <input id="jobs-query" name="q" type="search" placeholder="Job title or company…" defaultValue={filters.q} maxLength={120} />
      </div>
      <button type="button" aria-expanded={expanded} aria-controls="jobs-filter-options" onClick={() => setExpanded(!expanded)}>
        Filters{activeCount > 0 ? ` (${activeCount})` : ""} <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <fieldset id="jobs-filter-options">
        <legend className={styles.srOnly}>Additional job filters</legend>
        <div>
          <label htmlFor="jobs-discipline">Specialism</label>
          <select id="jobs-discipline" name="discipline" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>
            <option value="">All IT roles</option>
            {disciplines.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="jobs-employer">Company</label>
          <select id="jobs-employer" name="employer" value={employer} onChange={(event) => setEmployer(event.target.value)}>
            <option value="">All companies</option>
            {employers.map(({ token, name }) => <option key={token} value={token}>{name}</option>)}
          </select>
        </div>
      </fieldset>
      <input type="hidden" name="sort" value={filters.sort} />
      <div>
        <button type="submit">Find jobs</button>
        <Link href="/jobs">Reset filters</Link>
      </div>
    </form>
  );
}
