import directory from "../_components/singapore-directory.module.css";
import styles from "./hospital.module.css";

export default function Loading() {
  return <div className={`${directory.page} ${styles.page}`}><main className={directory.main}><section className={directory.state} role="status"><p className={directory.eyebrow}>SINGAPORE / HOSPITALS</p><h1>Loading hospitals…</h1><p>Fetching public hospital names and addresses.</p></section></main></div>;
}
