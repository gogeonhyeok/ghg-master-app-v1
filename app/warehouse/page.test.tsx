jest.mock("./data", () => ({ getWarehouseInventories: jest.fn(), getWarehouseMasterData: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getWarehouseInventories, getWarehouseMasterData } from "./data";
import WarehousePage from "./page";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getWarehouseInventories).mockResolvedValue({ rows: [{ id: "stock-1", cells: { invenNo: "IV-1", productId: "P1", productName: "Processor", locationId: "L1", locationNo: "A-01", qty: "0" } }], page: 1, pageSize: 50, total: 1175 });
  jest.mocked(getWarehouseMasterData).mockResolvedValue({ rows: [{ id: "product-1", cells: { productName: "Master product", productNo: "PR-1", productId: "MASTER-P1" } }], page: 1, pageSize: 25, total: 12962 });
});

test("renders inventories before master data, joins names, and preserves independent pagination", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  const tables = screen.getAllByRole("table");
  expect(tables[0]).toHaveAccessibleName("Inventory records");
  expect(tables[1]).toHaveAccessibleName("Products records");
  expect(within(tables[0]).getByText("Processor")).toBeInTheDocument();
  expect(within(tables[0]).getByText("P1")).toBeInTheDocument();
  expect(within(tables[0]).getByText("A-01")).toBeInTheDocument();
  expect(within(tables[1]).getAllByText("Master product")).toHaveLength(1);
  expect(within(tables[1]).getByText("MASTER-P1")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Locations" })).toHaveAttribute("href", "/warehouse?page=1&master=locations&masterPage=1#master-data");
  expect(within(screen.getByRole("navigation", { name: "Inventory pagination" })).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/warehouse?page=2&master=products&masterPage=1#inventories");
  expect(within(screen.getByRole("navigation", { name: "Products pagination" })).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/warehouse?page=1&master=products&masterPage=2#master-data");
});

test("selects location masters and validates URL inputs", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({ page: "2", master: "locations", masterPage: "3" }) }));
  expect(getWarehouseInventories).toHaveBeenCalledWith(2);
  expect(getWarehouseMasterData).toHaveBeenCalledWith("locations", 3);
  expect(screen.getByRole("link", { name: "Locations" })).toHaveAttribute("aria-current", "page");
});

test("falls back to Products for an unknown collection without accessing it", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({ master: "__proto__", page: "bad" }) }));
  expect(getWarehouseMasterData).toHaveBeenCalledWith("products", 1);
  expect(getWarehouseInventories).toHaveBeenCalledWith(1);
});

test("keeps master data visible when stock loading fails without exposing database details", async () => {
  jest.mocked(getWarehouseInventories).mockRejectedValue(new Error("Sensitive database error"));
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("status")).toHaveTextContent("WMS inventories are temporarily unavailable");
  expect(screen.getByRole("table", { name: "Products records" })).toBeInTheDocument();
  expect(screen.queryByText(/Sensitive database error/)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Retry ↗" })).toBeInTheDocument();
});

test("keeps stock visible when master loading fails", async () => {
  jest.mocked(getWarehouseMasterData).mockRejectedValue(new Error("Database unavailable"));
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("table", { name: "Inventory records" })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Products are temporarily unavailable");
});

test("renders empty states for both sections", async () => {
  const empty = { rows: [], total: 0, page: 1, pageSize: 25 };
  jest.mocked(getWarehouseInventories).mockResolvedValue(empty);
  jest.mocked(getWarehouseMasterData).mockResolvedValue(empty);
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("No inventory records yet.")).toBeInTheDocument();
  expect(screen.getByText("No products records yet.")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
