jest.mock("./data", () => ({ getCompanies: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getCompanies } from "./data";
import CompaniesPage from "./page";
import { formatRegistrationDate } from "./catalog";
import Loading from "./loading";

const company = { uen: "202600001A", name: "EXAMPLE PTE. LTD.", status: "Registered", entityType: "Local Company", registrationDate: "2026-01-01", streetName: "EXAMPLE ROAD", postalCode: "012345" };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getCompanies).mockResolvedValue({ page: 1, size: 25, total: 51, companies: [company] });
});

test("renders company details and source attribution with first-page pagination", async () => {
  render(await CompaniesPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Singapore companies");
  const table = screen.getByRole("table", { name: /Registered local companies in Singapore/ });
  for (const value of [company.name, company.uen, company.status, company.entityType, company.streetName, "Singapore 012345", "1 Jan 2026"]) {
    expect(within(table).getByText(value)).toBeInTheDocument();
  }
  const pagination = screen.getByRole("navigation", { name: "Companies pagination" });
  expect(within(pagination).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/companies?page=2&size=25");
  expect(within(pagination).queryByRole("link", { name: "← Previous" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "About the dataset ↗" })).toHaveAttribute("href", expect.stringContaining("data.gov.sg"));
});

test("preserves page size in navigation, refresh, and jump controls", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 2, size: 10, total: 30, companies: [company] });
  render(await CompaniesPage({ searchParams: Promise.resolve({ page: "2", size: "10" }) }));
  expect(getCompanies).toHaveBeenCalledWith(2, 10, "");
  const pagination = screen.getByRole("navigation", { name: "Companies pagination" });
  expect(pagination).toHaveTextContent("11–11 of 30 companies");
  expect(within(pagination).getByRole("link", { name: "← Previous" })).toHaveAttribute("href", "/companies?page=1&size=10");
  expect(within(pagination).getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/companies?page=3&size=10");
  expect(screen.getByRole("link", { name: "Refresh ↻" })).toHaveAttribute("href", "/companies?page=2&size=10");
  expect(screen.getByLabelText("Per page")).toHaveValue(10);
  expect(screen.getByLabelText("Go to page")).toHaveAttribute("max", "3");
});

test("shows a retry state when the Lambda endpoint is not deployed or is unavailable", async () => {
  jest.mocked(getCompanies).mockRejectedValue(new Error("Private AWS response"));
  render(await CompaniesPage({ searchParams: Promise.resolve({ page: "3", size: "50" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("Company data is temporarily unavailable");
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/companies?page=3&size=50");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.queryByText(/Private AWS response/)).not.toBeInTheDocument();
});

test("handles empty pages without showing a misleading result range", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 99, size: 25, total: 51, companies: [] });
  render(await CompaniesPage({ searchParams: Promise.resolve({ page: "99" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("No companies on this page");
  expect(screen.getByRole("link", { name: "Return to page 1" })).toHaveAttribute("href", "/companies?page=1&size=25");
  expect(screen.getByRole("navigation", { name: "Companies pagination" })).toHaveTextContent("0 shown · 51 companies");
  expect(screen.queryByRole("link", { name: "Next →" })).not.toBeInTheDocument();
});

test("handles a completely empty registry and disables next on the last page", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 1, size: 25, total: 0, companies: [] });
  render(await CompaniesPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("status")).toHaveTextContent("No companies available");
  expect(screen.queryByLabelText("Go to page")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Next →" })).not.toBeInTheDocument();
});

test("normalizes invalid query values before calling Lambda", async () => {
  render(await CompaniesPage({ searchParams: Promise.resolve({ page: ["2", "3"], size: "101" }) }));
  expect(getCompanies).toHaveBeenCalledWith(1, 25, "");
});

test("keeps name search in navigation, refresh, page size and jump, and resets page on search", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 2, size: 10, total: 30, companies: [company] });
  render(await CompaniesPage({ searchParams: Promise.resolve({ page: "2", size: "10", entity_name: "  DBS & Co  " }) }));
  expect(getCompanies).toHaveBeenCalledWith(2, 10, "DBS & Co");
  expect(screen.getByRole("searchbox", { name: "Search company name" })).toHaveValue("DBS & Co");
  const search = screen.getByRole("search", { name: "Search company name" }) as HTMLFormElement;
  expect(search).toHaveAttribute("method", "get");
  expect(search).toHaveAttribute("action", "/companies");
  expect(new FormData(search).get("page")).toBe("1");
  expect(new FormData(search).get("size")).toBe("10");
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/companies?page=1&size=10");
  expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/companies?page=3&size=10&entity_name=DBS+%26+Co");
  expect(screen.getByRole("link", { name: "← Previous" })).toHaveAttribute("href", "/companies?page=1&size=10&entity_name=DBS+%26+Co");
  expect(screen.getByRole("link", { name: "Refresh ↻" })).toHaveAttribute("href", "/companies?page=2&size=10&entity_name=DBS+%26+Co");
  for (const label of ["Per page", "Go to page"]) {
    expect(new FormData(screen.getByLabelText(label).closest("form")!).get("entity_name")).toBe("DBS & Co");
  }
});

test("shows no-match and retry states while keeping the search", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 1, size: 25, total: 0, companies: [] });
  const view = render(await CompaniesPage({ searchParams: Promise.resolve({ entity_name: "DBS" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("No matching companies");
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/companies?page=1&size=25");
  view.unmount();
  jest.mocked(getCompanies).mockRejectedValue(new Error("Private error"));
  render(await CompaniesPage({ searchParams: Promise.resolve({ entity_name: "DBS" }) }));
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/companies?page=1&size=25&entity_name=DBS");
});

test.each([["DBS", "OCBC"], "a".repeat(257)])("shows invalid search without fetching for %j", async (entity_name) => {
  render(await CompaniesPage({ searchParams: Promise.resolve({ entity_name }) }));
  expect(getCompanies).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Enter one name of up to 256 characters");
});

test("handles absent registry details and invalid dates", async () => {
  jest.mocked(getCompanies).mockResolvedValue({ page: 1, size: 25, total: 1, companies: [{ ...company, registrationDate: null, streetName: null, postalCode: null }] });
  render(await CompaniesPage({ searchParams: Promise.resolve({}) }));
  expect(within(screen.getByRole("table")).getAllByText("—")).toHaveLength(2);
  expect(formatRegistrationDate("not-a-date")).toBe("—");
  expect(formatRegistrationDate("2026-02-31")).toBe("—");
  expect(screen.queryByRole("link", { name: "Next →" })).not.toBeInTheDocument();
});

test("provides a loading announcement", () => {
  render(<Loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading companies");
});
