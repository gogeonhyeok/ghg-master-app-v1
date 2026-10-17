import Link from "next/link";
import { jobsUrl, type JobsFilters } from "./catalog";
import styles from "./page.module.css";

export default function JobsPagination({ filters, page, pages }: { filters: JobsFilters; page: number; pages: number }) {
  if (pages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Jobs pagination">
      {page > 1 ? <Link href={jobsUrl(filters, page - 1)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
      <span aria-current="page">Page {page} of {pages}</span>
      {page < pages ? <Link href={jobsUrl(filters, page + 1)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
    </nav>
  );
}
