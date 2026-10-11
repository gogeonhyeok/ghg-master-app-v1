import type { Metadata } from "next";
import Link from "next/link";
import { getWarehouseInventories, getWarehouseMasterData } from "./data";
import { inventoryColumns, isMasterKind, masterData, parsePage, type MasterKind, type RecordPage, type TableColumn } from "./catalog";
import styles from "./page.module.css";
import WarehouseTheme, { WarehouseThemeToggle } from "./WarehouseTheme";

export const metadata: Metadata = {
  title: "Warehouse | Go Gun Hyuk",
  description: "Warehouse inventory, products, locations, centers, and stock-keeping units.",
};
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Query = { page?: string | string[]; master?: string | string[]; masterPage?: string | string[] };
const countFormat = new Intl.NumberFormat("en-SG");

function warehouseUrl(page: number, master: MasterKind, masterPage: number, anchor = "") {
  const params = new URLSearchParams({ page: String(page), master, masterPage: String(masterPage) });
  return `/warehouse?${params}${anchor}`;
}

function DataTable({ data, columns, label, showReferences = false }: { data: RecordPage; columns: TableColumn[]; label: string; showReferences?: boolean }) {
  if (!data.rows.length) return <div className={styles.empty}><h3>No {label.toLowerCase()} records yet.</h3><p>Records will appear here when they are available.</p></div>;
  return (
    <div className={styles.tableScroll} role="region" aria-label={`${label} records`} tabIndex={0}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{label} records</caption>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.numeric ? styles.numeric : undefined}>{column.label}</th>)}</tr></thead>
        <tbody>{data.rows.map((row) => <tr key={row.id}>{columns.map((column) => {
          const name = showReferences ? column.key === "productId" ? row.cells.productName : column.key === "locationId" ? row.cells.locationNo : undefined : undefined;
          return <td key={column.key} className={column.numeric ? styles.numeric : undefined}>
            {name && name !== "—" ? <><span className={styles.referenceName}>{name}</span><span className={styles.referenceId}>{row.cells[column.key]}</span></> : row.cells[column.key]}
          </td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Pagination({ data, label, url }: { data: RecordPage; label: string; url: (page: number) => string }) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const first = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const last = Math.min(data.page * data.pageSize, data.total);
  return (
    <div className={styles.tablePagination}>
      <p>Showing {countFormat.format(first)}–{countFormat.format(last)} of {countFormat.format(data.total)}</p>
      <nav className={styles.pagination} aria-label={`${label} pagination`}>
        {data.page > 1 ? <Link href={url(data.page - 1)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
        <span>Page {data.page} of {countFormat.format(totalPages)}</span>
        {data.page < totalPages ? <Link href={url(data.page + 1)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
      </nav>
    </div>
  );
}

function Unavailable({ label, href }: { label: string; href: string }) {
  return <div className={styles.message} role="status"><div><h3>{label} are temporarily unavailable.</h3><p>Please try again in a moment.</p></div><a href={href}>Retry ↗</a></div>;
}

export default async function WarehousePage({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const master = typeof params.master === "string" && isMasterKind(params.master) ? params.master : "products";
  const [inventoryResult, masterResult] = await Promise.allSettled([
    getWarehouseInventories(parsePage(params.page)),
    getWarehouseMasterData(master, parsePage(params.masterPage)),
  ]);
  const inventories = inventoryResult.status === "fulfilled" ? inventoryResult.value : null;
  const masters = masterResult.status === "fulfilled" ? masterResult.value : null;
  const inventoryPage = inventories?.page || parsePage(params.page);
  const masterPage = masters?.page || parsePage(params.masterPage);
  const definition = masterData[master];
  const retryUrl = warehouseUrl(inventoryPage, master, masterPage);

  return (
    <WarehouseTheme>
      <main className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">← Workspace</Link><span>/</span><span>Warehouse</span></nav>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>WAREHOUSE MANAGEMENT</p><h1>Warehouse</h1><p className={styles.intro}>Stock positions and the master data that keep your warehouse organized.</p></div>
          <div className={styles.headerActions}><WarehouseThemeToggle /><a className={styles.refresh} href={retryUrl}>Refresh data ↻</a></div>
        </header>
        <nav className={styles.sectionLinks} aria-label="Warehouse sections"><a href="#inventories">Inventories ↓</a><a href="#master-data">Master data ↓</a></nav>

        <section id="inventories" className={styles.section} aria-labelledby="inventory-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / STOCK POSITION</p><h2 id="inventory-heading">WMS inventories</h2><p>Product quantities, storage locations, and planned movements.</p></div>{inventories && <span className={styles.count}>{countFormat.format(inventories.total)} records</span>}</div>
          <div className={styles.panel}>
            {inventories ? <><Pagination data={inventories} label="Inventory" url={(page) => warehouseUrl(page, master, masterPage, "#inventories")} /><DataTable data={inventories} columns={inventoryColumns} label="Inventory" showReferences /></> : <Unavailable label="WMS inventories" href={retryUrl} />}
          </div>
        </section>

        <section id="master-data" className={styles.section} aria-labelledby="master-heading">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / REFERENCE DATA</p><h2 id="master-heading">Master data</h2><p>Browse the products, locations, centers, and SKUs behind your stock.</p></div></div>
          <nav className={styles.tabs} aria-label="Master data collections">{(Object.keys(masterData) as MasterKind[]).map((kind) => <Link key={kind} href={warehouseUrl(inventoryPage, kind, 1, "#master-data")} aria-current={kind === master ? "page" : undefined}>{masterData[kind].label}</Link>)}</nav>
          <div className={styles.panel}>
            <div className={styles.masterHeading}><div><h3>{definition.label}</h3><p>{definition.description}</p></div>{masters && <span className={styles.count}>{countFormat.format(masters.total)} records</span>}</div>
            {masters ? <><Pagination data={masters} label={definition.label} url={(page) => warehouseUrl(inventoryPage, master, page, "#master-data")} /><DataTable data={masters} columns={definition.columns} label={definition.label} /></> : <Unavailable label={definition.label} href={retryUrl} />}
          </div>
        </section>
        <footer className={styles.footer}>Warehouse overview <span>Stock & reference data</span></footer>
      </main>
    </WarehouseTheme>
  );
}
