import "server-only";

import { isMasterKind, type MasterKind, type RecordPage, type WarehouseRow } from "./catalog";

export const defaultEndpoint = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/warehouse";

function parseRecordPage(payload: unknown, pageSize: number): RecordPage {
  if (!payload || typeof payload !== "object") throw new Error("Invalid warehouse response");
  const data = payload as Record<string, unknown>;
  if (!Number.isSafeInteger(data.total) || (data.total as number) < 0 ||
      !Number.isSafeInteger(data.page) || (data.page as number) < 1 || data.pageSize !== pageSize ||
      !Array.isArray(data.rows) || data.rows.length > pageSize || data.rows.length > (data.total as number) ||
      (data.page as number) > Math.max(1, Math.ceil((data.total as number) / pageSize))) {
    throw new Error("Invalid warehouse response");
  }
  const rows = data.rows.map((row: unknown): WarehouseRow => {
    if (!row || typeof row !== "object") throw new Error("Invalid warehouse row");
    const { id, cells } = row as Record<string, unknown>;
    if (typeof id !== "string" || !cells || typeof cells !== "object" || Array.isArray(cells) ||
        !Object.values(cells).every((cell) => typeof cell === "string")) throw new Error("Invalid warehouse row");
    return { id, cells: cells as Record<string, string> };
  });
  return { rows, total: data.total as number, page: data.page as number, pageSize };
}

async function readPage(resource: string, requestedPage: number, pageSize: number, baseUrl?: string): Promise<RecordPage> {
  const endpoint = (baseUrl || process.env.WAREHOUSE_API_URL || defaultEndpoint).replace(/\/+$/, "");
  const url = new URL(`${endpoint}/${resource}`);
  url.searchParams.set("page", String(requestedPage));
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("Warehouse data is unavailable.");
  return parseRecordPage(await response.json(), pageSize);
}

export async function getWarehouseInventories(requestedPage = 1): Promise<RecordPage> {
  return readPage("inventories", requestedPage, 50);
}

export async function getWarehouseOrders(requestedPage = 1): Promise<RecordPage> {
  return readPage("orders", requestedPage, 25);
}

export async function getWarehouseMasterData(kind: MasterKind, requestedPage = 1): Promise<RecordPage> {
  if (!isMasterKind(kind)) throw new Error("Unknown warehouse master data.");
  const masterEndpoint = process.env.WAREHOUSE_MASTER_API_URL;
  if (masterEndpoint) return readPage(kind, requestedPage, 25, masterEndpoint);
  return readPage(`master-data/${kind}`, requestedPage, 25);
}
