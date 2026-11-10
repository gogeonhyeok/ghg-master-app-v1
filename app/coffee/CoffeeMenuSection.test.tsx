import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import CoffeeMenuSection from "./CoffeeMenuSection";
import { getCoffeeMenus } from "./menu-actions";
import type { CoffeeMenus } from "./menus";

jest.mock("./menu-actions", () => ({ getCoffeeMenus: jest.fn() }));

const cafe = { slug: "test-cafe", name: "Test Cafe", city: null, country: "Singapore", url: "https://menumigo.com/test-cafe" };
const otherCafe = { ...cafe, slug: "porto-cafe", name: "Porto Cafe", city: "Porto", country: "Portugal", url: "https://menumigo.com/porto-cafe" };
const data: CoffeeMenus = {
  cafes: [cafe, otherCafe], count: 2,
  items: [
    { restaurant: cafe, name: "Latte", category: "Coffee", price: 5, currency: "SGD", isAvailable: true, description: "Espresso with milk." },
    { restaurant: otherCafe, name: "Espresso", category: "Coffee", price: 2, currency: "EUR", isAvailable: false },
  ],
  coverage: "A sample of published cafe menus.",
  source: { provider: "Menumigo", url: "https://menumigo.com", retrievedAt: "2026-11-10T14:00:00Z" },
};

beforeEach(() => { jest.mocked(getCoffeeMenus).mockReset().mockResolvedValue({ ok: true, data }); });

test("groups drinks by cafe with original currencies, availability and source links", async () => {
  render(<CoffeeMenuSection />);
  const cafeMenu = await screen.findByRole("article", { name: "Test Cafe" });
  expect(within(cafeMenu).getByText("Latte")).toBeInTheDocument();
  expect(within(cafeMenu).getByText("SGD 5.00", { exact: false })).toBeInTheDocument();
  expect(within(cafeMenu).getByText("Espresso with milk.")).toBeInTheDocument();
  expect(within(cafeMenu).getByText("Available")).toBeInTheDocument();
  expect(within(cafeMenu).queryByText("Espresso")).not.toBeInTheDocument();
  expect(within(cafeMenu).getByRole("link", { name: /View cafe menu/ })).toHaveAttribute("href", cafe.url);
  const portoMenu = screen.getByRole("article", { name: "Porto Cafe" });
  expect(within(portoMenu).getByText("EUR 2.00", { exact: false })).toBeInTheDocument();
  expect(within(portoMenu).getByText("Unavailable")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("2 drinks across 2 cafe menus");
  expect(screen.getByRole("link", { name: "Menumigo" })).toHaveAttribute("href", data.source.url);
  expect(screen.getByText(data.coverage)).toBeInTheDocument();
});

test("keeps menus on failed refresh", async () => {
  render(<CoffeeMenuSection />);
  await screen.findByRole("article", { name: "Test Cafe" });
  jest.mocked(getCoffeeMenus).mockResolvedValueOnce({ ok: false, message: "Couldn’t load coffee menus." });
  fireEvent.click(screen.getByRole("button", { name: "Refresh menus" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Previously loaded menus remain below"));
  expect(screen.getByText("Latte")).toBeInTheDocument();
});

test("supports retry after initial failure and displays empty menus", async () => {
  jest.mocked(getCoffeeMenus).mockRejectedValueOnce(new Error("network"));
  render(<CoffeeMenuSection />);
  await screen.findByText(/Couldn’t load coffee menus/);
  jest.mocked(getCoffeeMenus).mockResolvedValueOnce({ ok: true, data: { ...data, items: [], count: 0 } });
  fireEvent.click(screen.getByRole("button", { name: "Refresh menus" }));
  await screen.findByText("No coffee drinks found in the returned menus.");
  expect(screen.getAllByText("No matching coffee drinks in this cafe’s menu.")).toHaveLength(2);
});
