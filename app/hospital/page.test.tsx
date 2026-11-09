jest.mock("./data", () => ({ getHospitals: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getHospitals } from "./data";
import HospitalPage from "./page";
import Loading from "./loading";
import { parseHospitalQuery } from "./catalog";
import { hospital, payload } from "./test-fixtures";
import { projects } from "../projects";

beforeEach(() => { jest.clearAllMocks(); jest.mocked(getHospitals).mockResolvedValue(payload); });

test("shows hospital information, source attribution, contact and map links", async () => {
  render(await HospitalPage({ searchParams: Promise.resolve({}) }));
  expect(getHospitals).toHaveBeenCalledWith(1, 25, parseHospitalQuery().filters);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find a hospital");
  const card = screen.getByRole("article", { name: hospital.name! });
  for (const text of [hospital.address!, hospital.operator!, "general, cardiology", "Limited", hospital.phone!]) {
    expect(within(card).getByText(text)).toBeInTheDocument();
  }
  expect(screen.getByRole("link", { name: `View ${hospital.name} on map` })).toHaveAttribute("href", hospital.osmUrl);
  expect(screen.getByRole("link", { name: `Visit ${hospital.name} website` })).toHaveAttribute("href", hospital.website);
  expect(screen.getByRole("link", { name: `Call ${hospital.name}` })).toHaveAttribute("href", "tel:+6561234567");
  expect(screen.getByRole("link", { name: payload.source.attribution })).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
  expect(screen.getByText(/not live availability/)).toBeInTheDocument();
});

test("preserves multiple filters in pagination, refresh, size and page-jump forms", async () => {
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, page: 2, size: 10, total: 30 });
  render(await HospitalPage({ searchParams: Promise.resolve({ page: "2", size: "10", q: " General & Co ", operator: "Example", emergency: "yes", wheelchair: "limited" }) }));
  expect(screen.getByRole("searchbox", { name: "Search hospitals" })).toHaveValue("General & Co");
  expect(screen.getByLabelText("Operator")).toHaveValue("Example");
  const search = screen.getByRole("search", { name: "Search hospitals" });
  expect(search).toHaveAttribute("action", "/hospital");
  expect(new FormData(search as HTMLFormElement).get("page")).toBe("1");
  const expected = "size=10&q=General+%26+Co&operator=Example&emergency=yes&wheelchair=limited";
  expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute("href", `/hospital?page=3&${expected}`);
  expect(screen.getByRole("link", { name: "← Previous" })).toHaveAttribute("href", `/hospital?page=1&${expected}`);
  expect(screen.getByRole("link", { name: "Refresh ↻" })).toHaveAttribute("href", `/hospital?page=2&${expected}`);
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/hospital?page=1&size=10");
  for (const label of ["Per page", "Go to page"]) {
    const data = new FormData(screen.getByLabelText(label).closest("form")!);
    expect(data.get("q")).toBe("General & Co");
    expect(data.get("operator")).toBe("Example");
    expect(data.get("emergency")).toBe("yes");
    expect(data.get("wheelchair")).toBe("limited");
  }
});

test("keeps filters in retry links while hiding backend errors", async () => {
  jest.mocked(getHospitals).mockRejectedValue(new Error("Private AWS failure"));
  render(await HospitalPage({ searchParams: Promise.resolve({ name: "General", emergency: "yes", page: "3" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("Hospital data is temporarily unavailable");
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/hospital?page=3&size=25&name=General&emergency=yes");
  expect(screen.queryByText(/Private AWS/)).not.toBeInTheDocument();
});

test("shows no-match and out-of-range states with filtered return links", async () => {
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, total: 0, hospitals: [] });
  const view = render(await HospitalPage({ searchParams: Promise.resolve({ name: "Unmatched" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("No matching hospitals");
  expect(screen.queryByLabelText("Go to page")).not.toBeInTheDocument();
  view.unmount();
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, page: 99, hospitals: [] });
  render(await HospitalPage({ searchParams: Promise.resolve({ page: "99", speciality: "general" }) }));
  expect(screen.getByRole("link", { name: "Return to page 1" })).toHaveAttribute("href", "/hospital?page=1&size=25&speciality=general");
  expect(screen.getByRole("navigation", { name: "Hospitals pagination" })).toHaveTextContent("0 shown · 1 hospital features");
});

test("shows unknown fields without implying no emergency services and suppresses unsafe websites", async () => {
  jest.mocked(getHospitals).mockResolvedValue({ ...payload, hospitals: [{ ...hospital, name: null, address: null,
    operator: null, speciality: null, emergency: null, wheelchair: null, phone: null, website: "javascript:alert(1)", openingHours: null }] });
  render(await HospitalPage({ searchParams: Promise.resolve({}) }));
  const card = screen.getByRole("article", { name: "Unnamed hospital" });
  expect(within(card).getByText("Address not provided")).toBeInTheDocument();
  expect(within(card).getAllByText("Not provided")).toHaveLength(4);
  expect(screen.queryByRole("link", { name: /website/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Call/ })).not.toBeInTheDocument();
});

test.each([{ name: ["a", "b"] }, { q: "a".repeat(257) }, { emergency: "true" }, { wheelchair: "unknown" }])("rejects invalid filter URLs before calling Lambda: %j", async query => {
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
