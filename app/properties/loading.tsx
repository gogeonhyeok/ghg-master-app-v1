import styles from "./page.module.css";

export default function LoadingProperties() {
  return <div className={styles.page}>
    <main aria-busy="true">
      <section role="status">
        <p>ASIA / PROPERTY RECORDS</p>
        <h1>Loading property transactions…</h1>
        <p>Checking Singapore, South Korea and Taiwan.</p>
        <div aria-hidden="true"><span /><span /><span /></div>
      </section>
    </main>
  </div>;
}
