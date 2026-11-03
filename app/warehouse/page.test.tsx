jest.mock("./data", () => ({ getWarehouseInventories: jest.fn(), getWarehouseMasterData: jest.fn(), getWarehouseOrders: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getWarehouseInventories, getWarehouseMasterData, getWarehouseOrders } from "./data";
import WarehousePage from "./page";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getWarehouseInventories).mockResolvedValue({ rows: [{ id: "stock-1", cells: { invenNo: "IV-1", productId: "P1", productName: "Processor", locationId: "L1", locationNo: "A-01", qty: "0" } }], page: 1, pageSize: 50, total: 1175 });
  jest.mocked(getWarehouseOrders).mockResolvedValue({ rows: [{ id: "order-1", cells: { ordNo: "ORD-1", contactOrdNo: "CONTACT-1", centerNo: "BKK5", isUrgent: "No", collectBillAmount: "0" } }], page: 1, pageSize: 25, total: 192 });
  jest.mocked(getWarehouseMasterData).mockResolvedValue({ rows: [{ id: "product-1", cells: { productName: "Master product", productNo: "PR-1", productId: "MASTER-P1" } }], page: 1, pageSize: 25, total: 12962 });
});

test("renders inventories, orders, and master data with independent pagination", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  const tables = screen.getAllByRole("table");
  expect(tables[0]).toHaveAccessibleName("Inventory records");
  expect(tables[1]).toHaveAccessibleName("Orders records");
  expect(tables[2]).toHaveAccessibleName("Products records");
  expect(within(tables[0]).getByText("Processor")).toBeInTheDocument();
  expect(within(tables[0]).getByText("P1")).toBeInTheDocument();
  expect(within(tables[0]).getByText("A-01")).toBeInTheDocument();
  expect(within(tables[1]).getByText("ORD-1")).toBeInTheDocument();
  expect(within(tables[2]).getAllByText("Master product")).toHaveLength(1);
  expect(within(tables[2]).getByText("MASTER-P1")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Locations" })).toHaveAttribute("href", "/warehouse?page=1&ordersPage=1&master=locations&masterPage=1#master-data");
  expect(within(screen.getByRole("navigation", { name: "Inventory pagination" })).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/warehouse?page=2&ordersPage=1&master=products&masterPage=1#inventories");
  expect(within(screen.getByRole("navigation", { name: "Orders pagination" })).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/warehouse?page=1&ordersPage=2&master=products&masterPage=1#orders");
  expect(within(screen.getByRole("navigation", { name: "Products pagination" })).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/warehouse?page=1&ordersPage=1&master=products&masterPage=2#master-data");
});

test("selects location masters and validates URL inputs", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({ page: "2", ordersPage: "4", master: "locations", masterPage: "3" }) }));
  expect(getWarehouseInventories).toHaveBeenCalledWith(2);
  expect(getWarehouseOrders).toHaveBeenCalledWith(4);
  expect(getWarehouseMasterData).toHaveBeenCalledWith("locations", 3);
  expect(screen.getByRole("link", { name: "Locations" })).toHaveAttribute("aria-current", "page");
});

test("falls back to Products for an unknown collection without accessing it", async () => {
  render(await WarehousePage({ searchParams: Promise.resolve({ master: "__proto__", page: "bad" }) }));
  expect(getWarehouseMasterData).toHaveBeenCalledWith("products", 1);
  expect(getWarehouseInventories).toHaveBeenCalledWith(1);
  expect(getWarehouseOrders).toHaveBeenCalledWith(1);
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

test("keeps inventory and master data visible when orders fail", async () => {
  jest.mocked(getWarehouseOrders).mockRejectedValue(new Error("Database unavailable"));
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("table", { name: "Inventory records" })).toBeInTheDocument();
  expect(screen.getByRole("table", { name: "Products records" })).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Orders are temporarily unavailable");
});

test("renders empty states for all three sections", async () => {
  const empty = { rows: [], total: 0, page: 1, pageSize: 25 };
  jest.mocked(getWarehouseInventories).mockResolvedValue(empty);
  jest.mocked(getWarehouseOrders).mockResolvedValue(empty);
  jest.mocked(getWarehouseMasterData).mockResolvedValue(empty);
  render(await WarehousePage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("No inventory records yet.")).toBeInTheDocument();
  expect(screen.getByText("No orders records yet.")).toBeInTheDocument();
  expect(screen.getByText("No products records yet.")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});
