import { mapUrl, type HawkerCentre } from "./catalog";
import styles from "../_components/singapore-directory.module.css";

const count = new Intl.NumberFormat("en-SG");

export default function HawkerCentres({ centres }: { centres: HawkerCentre[] }) {
  return (
    <ul className={styles.cards} aria-label="Hawker centres">
      {centres.map((centre) => {
        const map = mapUrl(centre);
        return <li key={centre.id}><article className={styles.card} aria-labelledby={`centre-${centre.id}`}>
          <p className={styles.eyebrow}>NEA HAWKER CENTRE</p>
          <h3 id={`centre-${centre.id}`}>{centre.name}</h3>
          <p className={styles.address}>{centre.address}</p>
          <dl className={styles.stalls}>
            <div><dt>Food stalls</dt><dd>{centre.foodStalls === null ? "—" : count.format(centre.foodStalls)}</dd></div>
            <div><dt>Market stalls</dt><dd>{centre.marketStalls === null ? "—" : count.format(centre.marketStalls)}</dd></div>
          </dl>
          {centre.description && <details><summary>About this centre</summary><p>{centre.description}</p></details>}
          <div className={styles.cardFooter}>
            <span>Source status: {centre.status?.trim() || "Not provided"}</span>
            {map && <a href={map} target="_blank" rel="noopener noreferrer" aria-label={`View ${centre.name} on map`}>View on map ↗</a>}
          </div>
        </article></li>;
      })}
    </ul>
  );
}
