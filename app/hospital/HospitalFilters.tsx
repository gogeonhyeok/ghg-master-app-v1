import Link from "next/link";
import { filterKeys, hospitalUrl, type HospitalFilterKey, type HospitalFilters as Filters } from "./catalog";
import styles from "./hospital.module.css";
import directory from "../_components/singapore-directory.module.css";

export function HiddenHospitalFilters({ filters }: { filters: Filters }) {
  return <>{filterKeys.map(key => filters[key] && <input key={key} type="hidden" name={key} value={filters[key]} />)}</>;
}

const fields = [
  ["name", "Hospital name", "e.g. General"], ["operator", "Operator", "e.g. SingHealth"],
  ["speciality", "Specialty", "e.g. cardiology"], ["street", "Street", "e.g. Hospital Drive"],
  ["postal_code", "Postal code", "e.g. 169608"],
] as const;

export default function HospitalFilters({ filters, size, invalidFields }: {
  filters: Filters; size: number; invalidFields: HospitalFilterKey[];
}) {
  const hasFilters = filterKeys.some(key => filters[key]);
  const invalid = invalidFields.length > 0;
  const inputProps = (key: HospitalFilterKey) => ({
    id: `hospital-${key}`, name: key, defaultValue: filters[key],
    "aria-invalid": invalidFields.includes(key) || undefined,
    "aria-describedby": invalidFields.includes(key) ? "hospital-filter-error" : undefined,
  });
  return <form action="/hospital" method="get" className={styles.filters} role="search" aria-label="Search hospitals" key={hospitalUrl(1, size, filters)}>
    <input type="hidden" name="page" value="1" />
    <input type="hidden" name="size" value={size} />
    <div className={styles.searchRow}>
      <div><label htmlFor="hospital-q">Search hospitals</label><input {...inputProps("q")} type="search" maxLength={256} placeholder="Name, operator, specialty or address" /></div>
      <button type="submit">Search</button>
      {(hasFilters || invalid) && <Link prefetch={false} href={hospitalUrl(1, size)}>Clear search</Link>}
    </div>
    <details className={styles.advanced} open={filterKeys.some(key => key !== "q" && (filters[key] || invalidFields.includes(key)))}>
      <summary>More filters</summary>
      <div className={styles.filterGrid}>
        {fields.map(([key, label, placeholder]) => <div key={key}><label htmlFor={`hospital-${key}`}>{label}</label><input {...inputProps(key)} type="search" maxLength={256} placeholder={placeholder} /></div>)}
        <div><label htmlFor="hospital-emergency">Emergency services</label><select {...inputProps("emergency")}><option value="">Any / not specified</option><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div><label htmlFor="hospital-wheelchair">Wheelchair access</label><select {...inputProps("wheelchair")}><option value="">Any / not specified</option><option value="yes">Yes</option><option value="limited">Limited</option><option value="no">No</option></select></div>
      </div>
      <p>All selected filters must match. Missing access or emergency details are not treated as “No”.</p>
    </details>
    {invalid && <p id="hospital-filter-error" role="alert" className={directory.description}>Enter each search field once, with up to 256 characters. Choose an emergency or wheelchair option from the list.</p>}
  </form>;
}
