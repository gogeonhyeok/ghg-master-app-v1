import { disciplines, type Job } from "./catalog";
import { compactJobDateFormat, fullJobDateFormat } from "./presentation";
import styles from "./page.module.css";

export default function JobsList({ jobs, loading = false }: { jobs: Job[]; loading?: boolean }) {
  return (
    <ul className={styles.mobileList} aria-label="Singapore IT job opportunities" aria-hidden={loading || undefined}>
      {loading ? Array.from({ length: 6 }, (_, index) => (
        <li key={index}><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.skeleton} /></li>
      )) : jobs.map((job) => (
        <li key={job.id}>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            <span>{job.title}<span className={styles.srOnly}> (opens in a new tab)</span></span>
            <span aria-hidden="true">↗</span>
          </a>
          <p>{job.company} · Singapore</p>
          <details>
            <summary>
              <span>{disciplines.find(({ value }) => value === job.discipline)?.label}</span>
              <span> · {job.date ? <>{job.dateLabel} <time dateTime={job.date}>{compactJobDateFormat.format(new Date(job.date))}</time></> : "Date not provided"}</span>
              <span className={styles.srOnly}> — location and full date</span>
            </summary>
            <dl>
              <dt>Location</dt><dd>{job.location}</dd>
              <dt>{job.dateLabel}</dt><dd>{job.date ? <time dateTime={job.date}>{fullJobDateFormat.format(new Date(job.date))}</time> : "Date not provided"}</dd>
            </dl>
          </details>
        </li>
      ))}
    </ul>
  );
}
