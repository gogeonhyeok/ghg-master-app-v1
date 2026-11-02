export type TableColumn = { key: string; label: string; numeric?: boolean };
export type WarehouseRow = { id: string; cells: Record<string, string> };
export type RecordPage = { rows: WarehouseRow[]; total: number; page: number; pageSize: number };

export const inventoryColumns: TableColumn[] = [
  { key: "invenNo", label: "Inventory" },
  { key: "productId", label: "Product" },
  { key: "locationId", label: "Location" },
  { key: "centerNo", label: "Center" },
  { key: "qty", label: "Quantity", numeric: true },
  { key: "skuId", label: "SKU" },
  { key: "skuQty", label: "SKU quantity", numeric: true },
  { key: "pwPlanQty", label: "Put-away planned", numeric: true },
  { key: "piPlanQty", label: "Picking planned", numeric: true },
  { key: "invenStatus", label: "Status" },
];

type MasterDefinition = { label: string; description: string; collection: string; sortKey: string; columns: TableColumn[] };

export const masterData: Record<"products" | "locations" | "centers" | "skus", MasterDefinition> = {
  products: {
    label: "Products", description: "Product identifiers, names, and classifications.", collection: "masterProducts", sortKey: "productNo",
    columns: [
      { key: "productNo", label: "Product no." }, { key: "productName", label: "Name" },
      { key: "productId", label: "Product ID" }, { key: "productGroup", label: "Group" },
      { key: "productType", label: "Type" }, { key: "status", label: "Status" },
    ],
  },
  locations: {
    label: "Locations", description: "Storage locations and their position within each center.", collection: "locations", sortKey: "locationNo",
    columns: [
      { key: "locationNo", label: "Location" }, { key: "locationId", label: "Location ID" },
      { key: "centerNo", label: "Center" }, { key: "locationType", label: "Type" },
      { key: "zoneNo", label: "Zone" }, { key: "aisleNo", label: "Aisle" },
      { key: "bayNo", label: "Bay" }, { key: "levelNo", label: "Level" }, { key: "status", label: "Status" },
    ],
  },
  centers: {
    label: "Centers", description: "Warehouse centers, countries, and time zones.", collection: "centers", sortKey: "centerNo",
    columns: [
      { key: "centerNo", label: "Center" }, { key: "centerName", label: "Name" },
      { key: "centerType", label: "Type" }, { key: "country", label: "Country" },
      { key: "timeZoneId", label: "Time zone" }, { key: "status", label: "Status" },
    ],
  },
  skus: {
    label: "SKUs", description: "Stock-keeping units, packaging types, and dimensions.", collection: "masterSkus", sortKey: "skuId",
    columns: [
      { key: "skuId", label: "SKU" }, { key: "skuDesc", label: "Description" },
      { key: "skuType", label: "Type" }, { key: "width", label: "Width", numeric: true },
      { key: "length", label: "Length", numeric: true }, { key: "height", label: "Height", numeric: true },
      { key: "status", label: "Status" },
    ],
  },
};

export type MasterKind = keyof typeof masterData;

export function isMasterKind(value: string | undefined): value is MasterKind {
  return !!value && Object.hasOwn(masterData, value);
}

export function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
