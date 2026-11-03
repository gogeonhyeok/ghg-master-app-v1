import type { Metadata } from "next";
import Link from "next/link";
import { getWarehouseInventories, getWarehouseMasterData, getWarehouseOrders } from "./data";
import { inventoryColumns, isMasterKind, masterData, orderColumns, parsePage, type MasterKind, type RecordPage, type TableColumn } from "./catalog";
import WarehouseTheme, { WarehouseThemeToggle } from "./WarehouseTheme";

export const metadata: Metadata = {
  title: "Warehouse | Go Gun Hyuk",
  description: "Warehouse inventory, orders, products, locations, centers, and stock-keeping units.",
};
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Query = { page?: string | string[]; ordersPage?: string | string[]; master?: string | string[]; masterPage?: string | string[] };
const countFormat = new Intl.NumberFormat("en-SG");

function warehouseUrl(page: number, ordersPage: number, master: MasterKind, masterPage: number, anchor = "") {
  const params = new URLSearchParams({ page: String(page), ordersPage: String(ordersPage), master, masterPage: String(masterPage) });
  return `/warehouse?${params}${anchor}`;
}

function DataTable({ data, columns, label, showReferences = false }: { data: RecordPage; columns: TableColumn[]; label: string; showReferences?: boolean }) {
  if (!data.rows.length) return <section><h3>No {label.toLowerCase()} records yet.</h3><p>Records will appear here when they are available.</p></section>;
  return (
    <div role="region" aria-label={`${label} records`} tabIndex={0}>
      <table>
        <caption>{label} records</caption>
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col" data-numeric={column.numeric || undefined}>{column.label}</th>)}</tr></thead>
        <tbody>{data.rows.map((row) => <tr key={row.id}>{columns.map((column) => {
          const name = showReferences ? column.key === "productId" ? row.cells.productName : column.key === "locationId" ? row.cells.locationNo : undefined : undefined;
          return <td key={column.key} data-numeric={column.numeric || undefined}>
            {name && name !== "—" ? <><span>{name}</span><span>{row.cells[column.key]}</span></> : row.cells[column.key]}
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
    <nav aria-label={`${label} pagination`}>
      <p>Showing {countFormat.format(first)}–{countFormat.format(last)} of {countFormat.format(data.total)}</p>
      <div>
        {data.page > 1 ? <Link href={url(data.page - 1)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
        <span>Page {data.page} of {countFormat.format(totalPages)}</span>
        {data.page < totalPages ? <Link href={url(data.page + 1)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
      </div>
    </nav>
  );
}

function Unavailable({ label, href }: { label: string; href: string }) {
  return <section role="status"><div><h3>{label} are temporarily unavailable.</h3><p>Please try again in a moment.</p></div><a href={href}>Retry ↗</a></section>;
}

export default async function WarehousePage({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const master = typeof params.master === "string" && isMasterKind(params.master) ? params.master : "products";
  const [inventoryResult, ordersResult, masterResult] = await Promise.allSettled([
    getWarehouseInventories(parsePage(params.page)),
    getWarehouseOrders(parsePage(params.ordersPage)),
    getWarehouseMasterData(master, parsePage(params.masterPage)),
  ]);
  const inventories = inventoryResult.status === "fulfilled" ? inventoryResult.value : null;
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : null;
  const masters = masterResult.status === "fulfilled" ? masterResult.value : null;
  const inventoryPage = inventories?.page || parsePage(params.page);
  const ordersPage = orders?.page || parsePage(params.ordersPage);
  const masterPage = masters?.page || parsePage(params.masterPage);
  const definition = masterData[master];
  const retryUrl = warehouseUrl(inventoryPage, ordersPage, master, masterPage);

  return (
    <WarehouseTheme>
      <main>
        <nav aria-label="Breadcrumb"><Link href="/">← Workspace</Link><span>/</span><span>Warehouse</span></nav>
        <header>
          <div><p>WAREHOUSE MANAGEMENT</p><h1>Warehouse</h1><p>Stock positions, orders, and the master data that keep your warehouse organized.</p></div>
          <nav aria-label="Warehouse actions"><WarehouseThemeToggle /><a href={retryUrl}>Refresh data ↻</a></nav>
        </header>
        <nav aria-label="Warehouse sections"><a href="#inventories">Inventories ↓</a><a href="#orders">Orders ↓</a><a href="#master-data">Master data ↓</a></nav>

        <section id="inventories" aria-labelledby="inventory-heading">
          <header><div><p>01 / STOCK POSITION</p><h2 id="inventory-heading">WMS inventories</h2><p>Product quantities, storage locations, and planned movements.</p></div>{inventories && <data value={inventories.total}>{countFormat.format(inventories.total)} records</data>}</header>
          <article>
            {inventories ? <><Pagination data={inventories} label="Inventory" url={(page) => warehouseUrl(page, ordersPage, master, masterPage, "#inventories")} /><DataTable data={inventories} columns={inventoryColumns} label="Inventory" showReferences /></> : <Unavailable label="WMS inventories" href={retryUrl} />}
          </article>
        </section>

        <section id="orders" aria-labelledby="orders-heading">
          <header><div><p>02 / ORDER FLOW</p><h2 id="orders-heading">Orders</h2><p>Order references, warehouse timing, ownership, and operational flags.</p></div>{orders && <data value={orders.total}>{countFormat.format(orders.total)} records</data>}</header>
          <article>
            {orders ? <><Pagination data={orders} label="Orders" url={(page) => warehouseUrl(inventoryPage, page, master, masterPage, "#orders")} /><DataTable data={orders} columns={orderColumns} label="Orders" /></> : <Unavailable label="Orders" href={retryUrl} />}
          </article>
        </section>

        <section id="master-data" aria-labelledby="master-heading">
          <header><div><p>03 / REFERENCE DATA</p><h2 id="master-heading">Master data</h2><p>Browse the products, locations, centers, and SKUs behind your stock.</p></div></header>
          <nav aria-label="Master data collections">{(Object.keys(masterData) as MasterKind[]).map((kind) => <Link key={kind} href={warehouseUrl(inventoryPage, ordersPage, kind, 1, "#master-data")} aria-current={kind === master ? "page" : undefined}>{masterData[kind].label}</Link>)}</nav>
          <article>
            <header><div><h3>{definition.label}</h3><p>{definition.description}</p></div>{masters && <data value={masters.total}>{countFormat.format(masters.total)} records</data>}</header>
            {masters ? <><Pagination data={masters} label={definition.label} url={(page) => warehouseUrl(inventoryPage, ordersPage, master, page, "#master-data")} /><DataTable data={masters} columns={definition.columns} label={definition.label} /></> : <Unavailable label={definition.label} href={retryUrl} />}
          </article>
        </section>
        <footer>Warehouse overview <span>Stock, orders & reference data</span></footer>
      </main>
    </WarehouseTheme>
  );
}
