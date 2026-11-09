import styles from "../_components/singapore-directory.module.css";

export default function Loading() {
  return <div className={`${styles.page} ${styles.hawkerPage}`}><main className={styles.main}><section className={styles.state} role="status"><p className={styles.eyebrow}>SINGAPORE / HAWKER CULTURE</p><h1>Loading hawker centres…</h1><p>Fetching hawker centre records from NEA.</p></section></main></div>;
}
