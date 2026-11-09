import { phoneUrl, websiteUrl, type Hospital } from "./catalog";
import styles from "./hospital.module.css";
import directory from "../_components/singapore-directory.module.css";

const tagLabel = (value: string | null) => value === "yes" ? "Yes" : value === "no" ? "No" : value === "limited" ? "Limited" : value?.trim() || "Not provided";

export default function Hospitals({ hospitals }: { hospitals: Hospital[] }) {
  return <ul className={directory.cards} aria-label="Hospitals">
    {hospitals.map(hospital => {
      const name = hospital.name?.trim() || "Unnamed hospital";
      const id = `hospital-${hospital.id.replace("/", "-")}`;
      const website = websiteUrl(hospital.website);
      const phone = phoneUrl(hospital.phone);
      return <li key={hospital.id}><article className={directory.card} aria-labelledby={id}>
        <p className={directory.eyebrow}>SINGAPORE / HOSPITAL</p>
        <h3 id={id}>{name}</h3>
        <p className={directory.address}>{hospital.address?.trim() || "Address not provided"}</p>
        <dl className={styles.details}>
          <div><dt>Operator</dt><dd>{hospital.operator?.trim() || "Not provided"}</dd></div>
          <div><dt>Specialty</dt><dd>{hospital.speciality?.replace(/;/g, ", ") || "Not provided"}</dd></div>
          <div><dt>Emergency services</dt><dd>{tagLabel(hospital.emergency)}</dd></div>
          <div><dt>Wheelchair access</dt><dd>{tagLabel(hospital.wheelchair)}</dd></div>
        </dl>
        {(hospital.phone || website || hospital.openingHours) && <div className={styles.contact}>
          {hospital.phone && <p>{phone ? <a href={phone} aria-label={`Call ${name}`}>{hospital.phone}</a> : hospital.phone}</p>}
          {website && <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${name} website`}>Website ↗</a>}
          {hospital.openingHours && <p><span>Published hours: </span>{hospital.openingHours}</p>}
        </div>}
        <div className={`${directory.cardFooter} ${styles.cardFooter}`}>
          <span>OpenStreetMap</span>
          <a href={hospital.osmUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${name} on map`}>View on map ↗</a>
        </div>
      </article></li>;
    })}
  </ul>;
}
