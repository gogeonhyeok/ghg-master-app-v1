import "server-only";

import { Decimal128, ObjectId, type Db, type Document } from "mongodb";
import { getInventoriesDatabase } from "../inventories/data";
import { inventoryColumns, masterData, type MasterKind, type RecordPage, type TableColumn, type WarehouseRow } from "./catalog";

const numberFormat = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 6 });

function displayValue(value: unknown, numeric = false): string {
  if (value instanceof Decimal128) value = value.toString();
  if (value instanceof ObjectId) return value.toHexString();
  if (typeof value === "number") return Number.isFinite(value) ? numberFormat.format(value) : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && value.trim()) {
    if (numeric && Number.isFinite(Number(value))) return numberFormat.format(Number(value));
    return value;
  }
  return "—";
}

function normalize(document: Document, columns: TableColumn[]): WarehouseRow {
  return {
    id: String(document._id),
    cells: Object.fromEntries(columns.map((column) => [column.key, displayValue(document[column.key], column.numeric)])),
  };
}

async function readPage(database: Db, collectionName: string, columns: TableColumn[], sortKey: string, requestedPage: number, pageSize: number): Promise<RecordPage> {
  const collection = database.collection(collectionName);
  const total = await collection.countDocuments({}, { maxTimeMS: 5000 });
  const page = Math.min(Math.max(1, requestedPage), Math.max(1, Math.ceil(total / pageSize)));
  const projection = Object.fromEntries(columns.map((column) => [column.key, 1]));
  const documents = await collection.find({}, { projection })
    .sort({ [sortKey]: -1, _id: -1 }).skip((page - 1) * pageSize).limit(pageSize).maxTimeMS(5000).toArray();
  return { rows: documents.map((document) => normalize(document, columns)), total, page, pageSize };
}

export async function getWarehouseInventories(requestedPage = 1): Promise<RecordPage> {
  // The inventory service already pools connections to ghg-master-api-v1.
  const database = await getInventoriesDatabase();
  const result = await readPage(database, "wmsInventories", inventoryColumns, "createDate", requestedPage, 50);
  const productIds = [...new Set(result.rows.map((row) => row.cells.productId).filter((id) => id !== "—"))];
  const locationIds = [...new Set(result.rows.map((row) => row.cells.locationId).filter((id) => id !== "—"))];
  // Resolve names for this inventory page, even when those masters are on another page.
  // An unavailable reference lookup should not hide stock records.
  const [products, locations] = await Promise.allSettled([
    productIds.length ? database.collection("masterProducts").find({ productId: { $in: productIds } }, { projection: { productId: 1, productName: 1 } }).maxTimeMS(5000).toArray() : Promise.resolve([]),
    locationIds.length ? database.collection("locations").find({ locationId: { $in: locationIds } }, { projection: { locationId: 1, locationNo: 1 } }).maxTimeMS(5000).toArray() : Promise.resolve([]),
  ]);
  const productNames = new Map((products.status === "fulfilled" ? products.value : []).map((product) => [displayValue(product.productId), displayValue(product.productName)]));
  const locationNames = new Map((locations.status === "fulfilled" ? locations.value : []).map((location) => [displayValue(location.locationId), displayValue(location.locationNo)]));
  for (const row of result.rows) {
    row.cells.productName = productNames.get(row.cells.productId) || "—";
    row.cells.locationNo = locationNames.get(row.cells.locationId) || "—";
  }
  return result;
}

export async function getWarehouseMasterData(kind: MasterKind, requestedPage = 1): Promise<RecordPage> {
  const database = await getInventoriesDatabase();
  const definition = masterData[kind];
  return readPage(database, definition.collection, definition.columns, definition.sortKey, requestedPage, 25);
}
