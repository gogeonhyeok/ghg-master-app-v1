import styles from "./page.module.css";

export default function JobBoards() {
  return (
    <aside className={styles.boards} aria-labelledby="boards-heading">
      <h2 id="boards-heading">Search other boards</h2>
      <nav aria-label="External Singapore job searches">
        <a href="https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Singapore" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        <a href="https://www.glassdoor.sg/Job/singapore-software-engineer-jobs-SRCH_IL.0,9_IC3235921_KO10,27.htm" target="_blank" rel="noopener noreferrer">Glassdoor ↗</a>
        <a href="https://sg.jobstreet.com/information-communication-technology-jobs/in-Singapore" target="_blank" rel="noopener noreferrer">JobStreet ↗</a>
        <a href="https://www.mycareersfuture.gov.sg/search?search=software%20engineer&sortBy=new_posting_date&page=0" target="_blank" rel="noopener noreferrer">MyCareersFuture ↗</a>
      </nav>
      <p>External searches; their listings are not included above.</p>
    </aside>
  );
}
