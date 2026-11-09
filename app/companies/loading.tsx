import styles from "../_components/singapore-directory.module.css";

export default function Loading() {
  return <div className={styles.page}><main className={styles.main}><section className={styles.state} role="status"><p className={styles.eyebrow}>SINGAPORE / BUSINESS DIRECTORY</p><h1>Loading companies…</h1><p>Fetching company records from the registry.</p></section></main></div>;
}
