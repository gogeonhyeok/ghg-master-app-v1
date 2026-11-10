import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import AdminOrders from "./AdminOrders";
import CoffeePage from "./page";
import { listOrders, placeOrder } from "./actions";

jest.mock("./actions", () => ({ listOrders: jest.fn(), placeOrder: jest.fn() }));
jest.mock("./BeanPriceTracker", () => ({ __esModule: true, default: () => null }));
jest.mock("./CoffeeMenuSection", () => ({ __esModule: true, default: () => null }));

const originalFetch = global.fetch;
const firstOrder = {
  id: "order-123", customerName: "Alex", items: [{ name: "Americano", quantity: 2 }],
  status: "pending", createdAt: "2026-11-10T12:00:00Z",
};
const firstPage = { orders: [firstOrder], total: 26, page: 1, size: 25 };

beforeEach(() => {
  jest.mocked(listOrders).mockReset().mockResolvedValue({ ok: true, data: firstPage });
  jest.mocked(placeOrder).mockReset().mockResolvedValue({ ok: true, message: "Order received! Reference order-new." });
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
});
afterEach(() => { global.fetch = originalFetch; });

test("lists order details and supports pagination", async () => {
  render(<AdminOrders />);
  const table = await screen.findByRole("table");
  expect(within(table).getByText("Alex")).toBeInTheDocument();
  expect(within(table).getByText("2 × Americano")).toBeInTheDocument();
  expect(within(table).getByText("pending")).toBeInTheDocument();
  expect(within(table).getByText("order-123")).toBeInTheDocument();
  expect(table.querySelector("time")).toHaveAttribute("datetime", firstOrder.createdAt);
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  jest.mocked(listOrders).mockResolvedValueOnce({ ok: true, data: {
    ...firstPage, orders: [{ ...firstOrder, customerName: "Sam" }], page: 2,
  } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("Sam");
  expect(listOrders).toHaveBeenLastCalledWith(2);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Newest orders" }));
  await screen.findByText("Alex");
  expect(listOrders).toHaveBeenLastCalledWith(1);
});

test("keeps loaded orders when refreshing fails", async () => {
  render(<AdminOrders />);
  await screen.findByText("Alex");
  jest.mocked(listOrders).mockResolvedValueOnce({ ok: false, message: "Couldn’t load received orders." });
  fireEvent.click(screen.getByRole("button", { name: "Refresh orders" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Previously loaded orders remain below"));
  expect(screen.getByText("Alex")).toBeInTheDocument();
  expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
});

test("allows retrying an initial failure and shows an empty state", async () => {
  jest.mocked(listOrders).mockRejectedValueOnce(new Error("network"));
  render(<AdminOrders />);
  await screen.findByText(/Couldn’t load received orders/);
  jest.mocked(listOrders).mockResolvedValueOnce({ ok: true, data: { orders: [], total: 0, page: 1, size: 25 } });
  fireEvent.click(screen.getByRole("button", { name: "Refresh orders" }));
  await screen.findByText(/No orders received yet/);
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("submits once and refreshes the newest orders after success", async () => {
  let resolveOrder!: (value: { ok: boolean; message: string }) => void;
  jest.mocked(placeOrder).mockImplementationOnce(() => new Promise((resolve) => { resolveOrder = resolve; }));
  render(<CoffeePage />);
  await screen.findByText("Alex");
  fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), { target: { value: "Taylor" } });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "3" } });
  const form = screen.getByRole("button", { name: "Place order" }).closest("form")!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(placeOrder).toHaveBeenCalledTimes(1);
  const submitted = jest.mocked(placeOrder).mock.calls[0][0];
  expect(submitted.get("customerName")).toBe("Taylor");
  expect(submitted.get("quantity")).toBe("3");
  expect(screen.getByRole("button", { name: "Placing order…" })).toBeDisabled();
  jest.mocked(listOrders).mockResolvedValueOnce({ ok: true, data: {
    orders: [{ ...firstOrder, id: "order-new", customerName: "Taylor" }], total: 27, page: 1, size: 25,
  } });
  await act(async () => { resolveOrder({ ok: true, message: "Order received! Reference order-new." }); });
  await screen.findByText("Taylor");
  expect(listOrders).toHaveBeenLastCalledWith(1);
  expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
  expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveValue(1);
});

test("preserves form input and the order list when submission is unconfirmed", async () => {
  jest.mocked(placeOrder).mockRejectedValueOnce(new Error("network"));
  render(<CoffeePage />);
  await screen.findByText("Alex");
  fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), { target: { value: "Taylor" } });
  fireEvent.click(screen.getByRole("button", { name: "Place order" }));
  await screen.findByText(/check with the host before trying again/);
  expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("Taylor");
  expect(listOrders).toHaveBeenCalledTimes(1);
});
