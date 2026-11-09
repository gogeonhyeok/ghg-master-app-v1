import Link from "next/link";
import { directoryUrl, maxSearchLength } from "../_lib/singapore-directory";
import styles from "./singapore-directory.module.css";

export default function DirectorySearch({ path, parameter, search, size, label, placeholder, invalid = false }: {
  path: string; parameter: string; search: string; size: number; label: string; placeholder: string; invalid?: boolean;
}) {
  const id = `${parameter}-search`;
  return (
    <form action={path} method="get" className={styles.search} role="search" aria-label={label}>
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="size" value={size} />
      <div>
        <label htmlFor={id}>{label}</label>
        <input id={id} name={parameter} type="search" maxLength={maxSearchLength} defaultValue={search}
          key={search} placeholder={placeholder} aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined} />
        {invalid && <p id={`${id}-error`} role="alert">Enter one name of up to {maxSearchLength} characters.</p>}
      </div>
      <button type="submit">Search</button>
      {(search || invalid) && <Link prefetch={false} href={directoryUrl(path, 1, size, parameter)}>Clear search</Link>}
    </form>
  );
}
