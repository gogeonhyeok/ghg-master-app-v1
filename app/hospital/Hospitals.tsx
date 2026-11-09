import styles from "./hospital.module.css";
import type { Hospital } from "./catalog";
import directory from "../_components/singapore-directory.module.css";

export default function Hospitals({ hospitals }: { hospitals: Hospital[] }) {
  return <ul className={directory.cards} aria-label="Hospitals">
    {hospitals.map(hospital => <li key={hospital.id}>
      <article className={directory.card} aria-labelledby={`hospital-${hospital.id}`}>
        <p className={directory.eyebrow}>SINGAPORE / PUBLIC HOSPITAL</p>
        <h3 id={`hospital-${hospital.id}`}>{hospital.name}</h3>
        <p className={directory.address}>{hospital.address}</p>
        <div className={`${directory.cardFooter} ${styles.cardFooter}`}>
          <span>Government Directory</span>
          <a href={hospital.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${hospital.name} in Government Directory`}>View directory entry ↗</a>
        </div>
      </article>
    </li>)}
  </ul>;
}
