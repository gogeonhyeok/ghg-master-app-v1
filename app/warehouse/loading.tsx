import styles from "./page.module.css";

export default function Loading() {
  return <div className={styles.page}><main><section role="status"><h1>Loading warehouse…</h1><p>Fetching inventory and master data.</p></section></main></div>;
}
