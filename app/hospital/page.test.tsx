jest.mock("./data", () => ({ getHospitals: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getHospitals } from "./data";
import HospitalPage from "./page";
import Loading from "./loading";
import { parseHospitalQuery } from "./catalog";
import { hospital, payload } from "./test-fixtures";
import { projects } from "../projects";

beforeEach(() => { jest.clearAllMocks(); jest.mocked(getHospitals).mockResolvedValue(payload); });

test("shows public hospital names, addresses and government source links", async () => {
  render(await HospitalPage({ searchParams: Promise.resolve({}) }));
  expect(getHospitals).toHaveBeenCalledWith(1, 25, parseHospitalQuery().filters);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find a hospital");
  const card = screen.getByRole("article", { name: hospital.name });
  expect(within(card).getByText(hospital.address)).toBeInTheDocument();
  expect(within(card).getByRole("link", { name: `View ${hospital.name} in Government Directory` })).toHaveAttribute("href", hospital.sourceUrl);
  expect(screen.getByRole("link", { name: "Singapore Government Directory" })).toHaveAttribute("href", payload.source.url);
  expect(screen.getByText(/private hospitals are excluded/)).toBeInTheDocument();
  expect(screen.queryByText("Emergency services")).not.toBeInTheDocument();
});

test("preserves multiple filters in pagination, refresh, size and page-jump forms", async () => {
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, page: 2, size: 10, total: 30 });
  render(await HospitalPage({ searchParams: Promise.resolve({ page: "2", size: "10", q: " General & Co ", address: "Outram" }) }));
  expect(screen.getByRole("searchbox", { name: "Search hospitals" })).toHaveValue("General & Co");
  expect(screen.getByLabelText("Address")).toHaveValue("Outram");
  const search = screen.getByRole("search", { name: "Search hospitals" });
  expect(search).toHaveAttribute("action", "/hospital");
  expect(new FormData(search as HTMLFormElement).get("page")).toBe("1");
  const expected = "size=10&q=General+%26+Co&address=Outram";
  expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute("href", `/hospital?page=3&${expected}`);
  expect(screen.getByRole("link", { name: "← Previous" })).toHaveAttribute("href", `/hospital?page=1&${expected}`);
  expect(screen.getByRole("link", { name: "Refresh ↻" })).toHaveAttribute("href", `/hospital?page=2&${expected}`);
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/hospital?page=1&size=10");
  for (const label of ["Per page", "Go to page"]) {
    const data = new FormData(screen.getByLabelText(label).closest("form")!);
    expect(data.get("q")).toBe("General & Co");
    expect(data.get("address")).toBe("Outram");
  }
});

test("keeps filters in retry links while hiding backend errors", async () => {
  jest.mocked(getHospitals).mockRejectedValue(new Error("Private AWS failure"));
  render(await HospitalPage({ searchParams: Promise.resolve({ name: "General", address: "Outram", page: "3" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("Hospital data is temporarily unavailable");
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/hospital?page=3&size=25&name=General&address=Outram");
  expect(screen.queryByText(/Private AWS/)).not.toBeInTheDocument();
});

test("shows no-match and out-of-range states with filtered return links", async () => {
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, total: 0, hospitals: [] });
  const view = render(await HospitalPage({ searchParams: Promise.resolve({ name: "Unmatched" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("No matching hospitals");
  expect(screen.queryByLabelText("Go to page")).not.toBeInTheDocument();
  view.unmount();
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, page: 99, hospitals: [] });
  render(await HospitalPage({ searchParams: Promise.resolve({ page: "99", address: "Outram" }) }));
  expect(screen.getByRole("link", { name: "Return to page 1" })).toHaveAttribute("href", "/hospital?page=1&size=25&address=Outram");
  expect(screen.getByRole("navigation", { name: "Hospitals pagination" })).toHaveTextContent("0 shown · 1 hospital entries");
});

test.each([{ name: ["a", "b"] }, { q: "a".repeat(257) }, { address: ["a", "b"] }])("rejects invalid filter URLs before calling Lambda: %j", async query => {
  render(await HospitalPage({ searchParams: Promise.resolve(query) }));
  expect(getHospitals).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Enter each search field once");
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/hospital?page=1&size=25");
});

test("announces loading and exposes the route through workspace navigation", () => {
  render(<Loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading hospitals");
  expect(projects).toContainEqual(expect.objectContaining({ href: "/hospital", label: "Hospitals" }));
});
