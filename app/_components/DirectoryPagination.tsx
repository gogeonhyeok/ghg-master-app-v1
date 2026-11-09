import Link from "next/link";
import { directoryUrl, maxPage } from "../_lib/singapore-directory";
import styles from "./singapore-directory.module.css";

const count = new Intl.NumberFormat("en-SG");

export default function DirectoryPagination({ page, size, total, shown, path, parameter, search = "", label, noun }: {
  page: number; size: number; total: number; shown: number; path: string; parameter: string; search?: string; label: string; noun: string;
}) {
  const pages = Math.min(maxPage, Math.max(1, Math.ceil(total / size)));
  const first = shown ? (page - 1) * size + 1 : 0;
  const last = shown ? first + shown - 1 : 0;
  return (
    <nav className={styles.pagination} aria-label={label}>
      <p>{first ? `${count.format(first)}–${count.format(last)} of ${count.format(total)} ${noun}` : `0 shown · ${count.format(total)} ${noun}`}</p>
      <div>
        {page > 1 ? <Link prefetch={false} href={directoryUrl(path, page - 1, size, parameter, search)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
        <span>Page {count.format(page)}{page <= pages ? ` of ${count.format(pages)}` : ""}</span>
        {page < pages ? <Link prefetch={false} href={directoryUrl(path, page + 1, size, parameter, search)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
      </div>
    </nav>
  );
}
