import Link from "next/link";
import type { JobsFilters } from "./catalog";
import { partTimeUrl, type PartTimeFeed } from "./part-time";
import { jobDateFormat } from "./presentation";
import styles from "./page.module.css";

export default function PartTimeJobs({ feed, filters }: { feed: PartTimeFeed; filters: JobsFilters }) {
  return (
    <section aria-labelledby="part-time-heading">
      <header>
        <div>
          <h2 id="part-time-heading">Remote part-time jobs</h2>
          <p>Open to applicants in Singapore · All industries · Refreshed daily</p>
        </div>
        <a href={partTimeUrl(filters, feed.page)}>Reload part-time jobs ↻</a>
      </header>

      {feed.available ? (
        <>
          <p>{feed.jobs.length} {feed.jobs.length === 1 ? "role" : "roles"} on this page · Independent of the IT filters above</p>
          {feed.jobs.length > 0 ? (
            <div className={`${styles.tableScroll} ${styles.partTimeTable}`} role="region" aria-label="Remote part-time job results" tabIndex={0}>
              <table>
                <caption className={styles.srOnly}>Remote part-time job opportunities open to Singapore applicants</caption>
                <thead>
                  <tr>{["Role", "Company", "Category", "Eligibility", "Pay", "Updated", "Action"].map((column) => <th key={column} scope="col">{column}</th>)}</tr>
                </thead>
                <tbody>
                  {feed.jobs.map((job) => (
                    <tr key={job.id}>
                      <th scope="row">
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          {job.title}<span className={styles.srOnly}> (opens in a new tab)</span>
                        </a>
                        {job.excerpt && <details><summary>About this role</summary><p>{job.excerpt}</p></details>}
                      </th>
                      <td>{job.company}</td>
                      <td>{job.categories.length ? <span className={styles.tag}>{job.categories.join(" · ")}</span> : "Not provided"}</td>
                      <td>{job.eligibility}</td>
                      <td>{job.salary ?? "See listing for pay details"}</td>
                      <td>{job.updatedAt ? <time dateTime={job.updatedAt}>{jobDateFormat.format(new Date(job.updatedAt))}</time> : "Not provided"}</td>
                      <td><a href={job.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${job.title} at ${job.company} (opens in a new tab)`}>View ↗</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <article>
              <h3>{feed.page > 1 ? "No more matching roles on this page." : "No matching part-time roles right now."}</h3>
              <p>Explore the other part-time searches below, or check back for fresh opportunities.</p>
              {feed.page > 1 && <Link href={partTimeUrl(filters, 1)}>Back to the latest roles →</Link>}
            </article>
          )}
        </>
      ) : (
        <article>
          <h3>Part-time listings are temporarily unavailable.</h3>
          <p>Himalayas could not be reached. Try reloading the part-time jobs, or use the searches below.</p>
        </article>
      )}

      {feed.available && (feed.page > 1 || feed.hasNext) && (
        <nav className={styles.pagination} aria-label="Part-time jobs pagination">
          {feed.page > 1 ? <Link href={partTimeUrl(filters, feed.page - 1)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
          <span aria-current="page">Page {feed.page}</span>
          {feed.hasNext ? <Link href={partTimeUrl(filters, feed.page + 1)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
        </nav>
      )}
      <nav aria-label="External Singapore part-time job searches">
        <a href="https://sg.jobstreet.com/part-time-jobs/in-Singapore" target="_blank" rel="noopener noreferrer">Part-time on JobStreet ↗</a>
        <a href="https://www.linkedin.com/jobs/search/?location=Singapore&f_JT=P" target="_blank" rel="noopener noreferrer">Part-time on LinkedIn ↗</a>
      </nav>
      <footer>
        <p>Source: <a href="https://himalayas.app" target="_blank" rel="noopener noreferrer">Himalayas ↗</a>. Remote roles marked part-time and open to Singapore applicants, including worldwide roles. Check each listing for hours, qualifications, and any in-person requirements. External searches include local opportunities.</p>
      </footer>
    </section>
  );
}
