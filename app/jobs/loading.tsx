import JobsResults from "./JobsResults";
import styles from "./page.module.css";

export default function LoadingJobs() {
  return (
    <div className={styles.page}>
      <main aria-busy="true">
        <div className={styles.loading} role="status">
          <h1>Singapore IT jobs</h1>
          <p>Checking employer job boards…</p>
        </div>
        <JobsResults jobs={[]} loading />
      </main>
    </div>
  );
}
