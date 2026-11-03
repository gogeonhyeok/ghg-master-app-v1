import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import BeanPriceTracker from "./BeanPriceTracker";
import { beanCatalog, normalizeBean, type BeanPriceResponse } from "./bean-prices";
import { BEAN_STORAGE_KEY } from "./bean-history";

const originalFetch = global.fetch;
const data: BeanPriceResponse = {
  currency: "SGD", cacheSeconds: 3600,
  listings: [beanCatalog[0], beanCatalog[3]].map((bean, index) => normalizeBean(bean, {
    variants: [
      { id: index * 10 + 1, option1: "250g", option2: "Whole Beans", price: "24.00", available: !index },
      { id: index * 10 + 2, option1: "1kg", option2: "Whole Beans", price: "76.00", available: true },
    ],
  }, "2026-11-03T10:00:00.000Z")),
};
const mockFetch = jest.fn();
beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset().mockResolvedValue({ ok: true, json: async () => data });
  global.fetch = mockFetch;
});
afterEach(() => { global.fetch = originalFetch; });

test("compares actual pack variants and filters by retailer and stock", async () => {
  render(<BeanPriceTracker />);
  const nuts = await screen.findByRole("article", { name: "Nuts & Bolts" });
  expect(within(nuts).getByText("S$9.60 / 100g")).toBeInTheDocument();
  fireEvent.change(within(nuts).getByRole("combobox", { name: "Bag size for Nuts & Bolts" }), { target: { value: "2" } });
  expect(within(nuts).getByText("S$76.00")).toBeInTheDocument();
  expect(within(nuts).getByText("S$7.60 / 100g")).toBeInTheDocument();
  expect(within(nuts).getByRole("link", { name: /View at roaster/ })).toHaveAttribute("href", expect.stringContaining("?variant=2"));
  fireEvent.click(screen.getByRole("checkbox", { name: "In stock only" }));
  expect(screen.queryByRole("article", { name: "CMCR Espresso Blend" })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "Roaster" }), { target: { value: "common-man" } });
  expect(screen.getByText(/No beans match these filters/)).toBeInTheDocument();
});

test("persists the watchlist across visits", async () => {
  const { unmount } = render(<BeanPriceTracker />);
  await screen.findByRole("article", { name: "Nuts & Bolts" });
  fireEvent.click(screen.getByRole("button", { name: "Follow Nuts & Bolts" }));
  expect(JSON.parse(localStorage.getItem(BEAN_STORAGE_KEY)!).watched).toContain(data.listings[0].id);
  unmount();
  render(<BeanPriceTracker />);
  await screen.findByRole("button", { name: "Unfollow Nuts & Bolts" });
  fireEvent.click(screen.getByRole("button", { name: /My watchlist/ }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
});

test("shows a real price change without mixing bag sizes or inventing earlier history", async () => {
  render(<BeanPriceTracker />);
  const nuts = await screen.findByRole("article", { name: "Nuts & Bolts" });
  expect(within(nuts).getByText("History starts with this check")).toBeInTheDocument();
  const next: BeanPriceResponse = JSON.parse(JSON.stringify(data));
  next.listings[0].checkedAt = "2026-11-04T10:00:00.000Z";
  next.listings[0].variants[0].priceCents = 2200;
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => next });
  fireEvent.click(screen.getByRole("button", { name: "Refresh listings" }));
  expect(await within(nuts).findByText("↓ S$2.00 since last check")).toBeInTheDocument();
  expect(within(nuts).getByRole("img", { name: /Last 2 observed bag prices: S\$24.00, S\$22.00/ })).toBeInTheDocument();
  fireEvent.change(within(nuts).getByRole("combobox"), { target: { value: "2" } });
  expect(within(nuts).getByText("Unchanged since last check")).toBeInTheDocument();
});

test("keeps previously loaded prices if refresh fails and provides source links", async () => {
  render(<BeanPriceTracker />);
  await screen.findByRole("article", { name: "Nuts & Bolts" });
  mockFetch.mockRejectedValueOnce(new Error("Network unavailable"));
  fireEvent.click(screen.getByRole("button", { name: "Refresh listings" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Previously loaded listings remain below"));
  expect(screen.getByRole("article", { name: "Nuts & Bolts" })).toBeInTheDocument();
  expect(within(screen.getByRole("navigation", { name: "Coffee bean price sources" })).getAllByRole("link")).toHaveLength(2);
});
