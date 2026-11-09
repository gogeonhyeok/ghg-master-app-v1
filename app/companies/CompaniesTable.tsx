import { formatRegistrationDate, type Company } from "./catalog";
import styles from "../_components/singapore-directory.module.css";

export default function CompaniesTable({ companies }: { companies: Company[] }) {
  return (
    <div className={styles.tableScroll} role="region" aria-label="Singapore company records" tabIndex={0}>
      <table className={styles.table}>
        <caption>Registered local companies in Singapore, ordered by UEN</caption>
        <thead><tr><th scope="col">Company</th><th scope="col">UEN</th><th scope="col">Registration date</th><th scope="col">Registered address</th><th scope="col">Status</th></tr></thead>
        <tbody>{companies.map((company) => <tr key={company.uen}>
          <th scope="row"><strong>{company.name}</strong><small>{company.entityType}</small></th>
          <td className={styles.mono}>{company.uen}</td>
          <td className={styles.date}>{formatRegistrationDate(company.registrationDate)}</td>
          <td>{company.streetName?.trim() || "—"}{company.postalCode?.trim() && <small>Singapore {company.postalCode}</small>}</td>
          <td><span className={styles.badge}>{company.status}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
