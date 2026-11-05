import { expect, test } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Transactions from "./Transactions";
import { propertyFixture, usdFixture } from "./fixtures";

test("defaults to ascending USD prices and switches order across markets immediately", () => {
  const items = propertyFixture().items;
  render(<Transactions items={items} month="2026-10" rates={usdFixture} />);
  const addresses = () => within(screen.getByRole("table")).getAllByRole("row").slice(1).map((row) => within(row).getByRole("rowheader").textContent);
  expect(addresses()).toEqual([expect.stringContaining(items[1].address), expect.stringContaining(items[2].address), expect.stringContaining(items[0].address)]);
  expect(screen.getByRole("columnheader", { name: "Estimated USD" })).toHaveAttribute("aria-sort", "ascending");
  const sort = screen.getByRole("combobox", { name: "Sort loaded records" });
  fireEvent.change(sort, { target: { value: "usd-desc" } });
  expect(addresses()).toEqual([expect.stringContaining(items[0].address), expect.stringContaining(items[2].address), expect.stringContaining(items[1].address)]);
  expect(screen.getByRole("columnheader", { name: "Estimated USD" })).toHaveAttribute("aria-sort", "descending");
  fireEvent.change(sort, { target: { value: "source" } });
  expect(addresses()).toEqual(items.map(({ address }) => expect.stringContaining(address)));
  expect(screen.getByText(/1 USD = 2000 KRW/)).toHaveTextContent("2026-11-04");
  expect(screen.getByText(/current reference rates/)).toBeInTheDocument();
});

test("keeps local prices and source order available when exchange rates cannot be loaded", () => {
  render(<Transactions items={propertyFixture().items} month="2026-10" rates={null} />);
  expect(screen.getByRole("status")).toHaveTextContent("USD conversion is temporarily unavailable");
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByRole("combobox")).toHaveValue("source");
  expect(screen.getByText(/SGD\s+650,000/)).toBeInTheDocument();
  expect(screen.getAllByText("—")).toHaveLength(3);
  expect(screen.getByRole("columnheader", { name: "Estimated USD" })).toHaveAttribute("aria-sort", "none");
});
