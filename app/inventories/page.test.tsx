jest.mock("./data", () => ({ getInventories: jest.fn() }));
jest.mock("./InventoryForm", () => function MockInventoryForm() {
  return <div data-testid="inventory-form">Inventory form</div>;
});

import { render, screen } from "@testing-library/react";
import { getInventories } from "./data";
import InventoriesPage from "./page";

beforeEach(() => jest.clearAllMocks());

test("renders the empty collection state", async () => {
  jest.mocked(getInventories).mockResolvedValue([]);
  render(await InventoriesPage());
  expect(screen.getByRole("heading", { name: "Inventories", level: 1 })).toBeInTheDocument();
  expect(screen.getByText("No inventory records yet.")).toBeInTheDocument();
  expect(screen.getByTestId("inventory-form")).toBeInTheDocument();
});

test("renders inventory data and timestamps", async () => {
  jest.mocked(getInventories).mockResolvedValue([{
    id: "one",
    name: "Camera",
    description: "Studio kit",
    createdDate: "2026-10-04T01:00:00.000Z",
    updatedDate: "2026-10-04T02:00:00.000Z",
    photo: "",
  }]);
  render(await InventoriesPage());
  expect(screen.getByRole("heading", { name: "Camera" })).toBeInTheDocument();
  expect(screen.getByText("Studio kit")).toBeInTheDocument();
  expect(screen.getByText("1 item")).toBeInTheDocument();
  expect(screen.getAllByRole("time")[0]).toHaveAttribute("dateTime", "2026-10-04T01:00:00.000Z");
});

test("shows a safe unavailable state when loading fails", async () => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.mocked(getInventories).mockRejectedValue(new Error("private database details"));
  render(await InventoriesPage());
  expect(screen.getByRole("status")).toHaveTextContent("Inventories are temporarily unavailable.");
  expect(screen.queryByText("private database details")).not.toBeInTheDocument();
});
