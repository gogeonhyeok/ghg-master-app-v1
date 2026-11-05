import styles from "./page.module.css";

export default function LoadingProperties() {
  return <div className={styles.page}><main className={styles.main} aria-busy="true"><div className={styles.loading} role="status"><p className={styles.eyebrow}>ASIA / PROPERTY RECORDS</p><h1>Loading property transactions…</h1><p>Checking Singapore, South Korea and Taiwan.</p><div className={styles.skeletons} aria-hidden="true"><span /><span /><span /></div></div></main></div>;
}
