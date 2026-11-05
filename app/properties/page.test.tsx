import { beforeEach, expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
import "@testing-library/jest-dom/jest-globals";
jest.mock("./data", () => ({ getProperties: jest.fn() }));
jest.mock("./exchange", () => ({ getUsdRates: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import PropertiesPage from "./page";
import { getProperties } from "./data";
import { getUsdRates } from "./exchange";
import { propertyFixture, usdFixture } from "./fixtures";

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getProperties).mockResolvedValue({ available: true, data: propertyFixture() });
  jest.mocked(getUsdRates).mockResolvedValue(usdFixture);
});
const query = { month: "2026-10" };

test("renders all three markets, native currencies, original records and accessible filters", async () => {
  render(await PropertiesPage({ searchParams: Promise.resolve(query) }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Property transactions");
  expect(screen.getByLabelText(/Transaction month/)).toHaveValue("2026-10");
  expect(screen.getByLabelText(/HDB town/)).toHaveAttribute("name", "town");
  expect(screen.getByLabelText(/Korean location/)).toHaveValue("서울특별시 종로구");
  expect(screen.getByLabelText(/Taiwan city/)).toHaveValue("A");
  const table = screen.getByRole("table", { name: /Property sales/ });
  expect(within(table).getAllByRole("row")).toHaveLength(4);
  expect(within(table).getByText(/SGD\s+650,000/)).toBeInTheDocument();
  expect(within(table).getByText(/KRW\s+850,000,000/)).toBeInTheDocument();
  expect(within(table).getByText(/TWD\s+25,000,000/)).toBeInTheDocument();
  expect(within(table).getByText("90 m²")).toBeInTheDocument();
  expect(within(table).getAllByText("View record")).toHaveLength(3);
  expect(within(table).getByText(/USD\s+425,000.00/)).toBeInTheDocument();
  expect(screen.getByText(/Sorting applies to the records on this page/)).toBeInTheDocument();
});

test("validates query parameters without requesting the Lambda", async () => {
  render(await PropertiesPage({ searchParams: Promise.resolve({ month: "2026-13" }) }));
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a month");
  expect(getProperties).not.toHaveBeenCalled();
  expect(getUsdRates).not.toHaveBeenCalled();
});

test("distinguishes a failed provider from a successful empty result and preserves retry filters", async () => {
  jest.mocked(getProperties).mockResolvedValue({ available: false });
  const view = render(await PropertiesPage({ searchParams: Promise.resolve({ ...query, town: "ang mo kio", city: "F" }) }));
  expect(screen.getByRole("alert")).toHaveTextContent("temporarily unavailable");
  expect(screen.getByRole("link", { name: /Try again/ }).getAttribute("href")).toContain("town=ANG+MO+KIO");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  const data = propertyFixture(); data.items = []; data.returned = 0; data.total = 0;
  data.sources = data.sources.map((source) => ({ ...source, total: 0, returned: 0 }));
  jest.mocked(getProperties).mockResolvedValue({ available: true, data });
  view.rerender(await PropertiesPage({ searchParams: Promise.resolve(query) }));
  expect(screen.getByText("No transactions on this page.")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("keeps location filters across pagination and exposes collection gaps and truncation", async () => {
  const data = propertyFixture();
  data.sources[1] = { ...data.sources[1], total: 1000, available: 500, truncated: true, missingMonths: ["2026-10"] };
  jest.mocked(getProperties).mockResolvedValue({ available: true, data });
  render(await PropertiesPage({ searchParams: Promise.resolve({ ...query, town: "ang mo kio", city: "F" }) }));
  expect(screen.getByText(/Only the newest 500/)).toBeInTheDocument();
  expect(screen.getByText(/Collection gaps: 2026-10/)).toBeInTheDocument();
  const pagination = screen.getByRole("navigation", { name: "Property pagination" });
  const next = within(pagination).getByRole("link", { name: /Next/ });
  expect(next.getAttribute("href")).toContain("page=2");
  expect(next.getAttribute("href")).toContain("city=F");
  expect(next.getAttribute("href")).toContain("town=ANG+MO+KIO");
  expect(within(pagination).getByText(/Previous/)).toHaveAttribute("aria-disabled", "true");
});
