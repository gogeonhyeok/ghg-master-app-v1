import type { CSSProperties } from "react";
import { disciplines, employers, type Job } from "./catalog";
import styles from "./page.module.css";
import { jobDateFormat } from "./presentation";

const columns = ["Role", "Company", "Specialism", "Location", "Date", "Action"];

export default function JobsTable({ jobs, loading = false }: { jobs: Job[]; loading?: boolean }) {
  return (
    <div
      className={styles.tableScroll}
      role={loading ? undefined : "region"}
      aria-label={loading ? undefined : "Singapore IT job results"}
      tabIndex={loading ? undefined : 0}
      aria-hidden={loading || undefined}
    >
      <table>
        <caption className={styles.srOnly}>Singapore IT job opportunities from selected employers</caption>
        <thead>
          <tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? Array.from({ length: 8 }, (_, index) => (
            <tr key={index}>{columns.map((column) => <td key={column}><span className={styles.skeleton} /></td>)}</tr>
          )) : jobs.map((job) => {
            const employer = employers.find(({ token }) => token === job.employer);
            return (
              <tr key={job.id}>
                <th scope="row">
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    {job.title}<span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                </th>
                <td>
                  <span className={styles.company}>
                    <span style={{ "--company-color": employer?.color } as CSSProperties} aria-hidden="true">{employer?.initials}</span>
                    {job.company}
                  </span>
                </td>
                <td><span className={styles.tag}>{disciplines.find(({ value }) => value === job.discipline)?.label}</span></td>
                <td>{job.location}</td>
                <td>{job.date ? <><small>{job.dateLabel}</small><time dateTime={job.date}>{jobDateFormat.format(new Date(job.date))}</time></> : "Not provided"}</td>
                <td><a href={job.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title} at ${job.company} (opens in a new tab)`}>View ↗</a></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
