jest.mock("./data", () => ({ getKopitiams: jest.fn() }));

import { render, screen, within } from "@testing-library/react";
import { getKopitiams } from "./data";
import KopitiamPage from "./page";
import { datasetId, datasetUrl } from "./catalog";
import Loading from "./loading";

const centre = { id: "1", name: "Adam Road Food Centre", address: "2 Adam Road, Singapore 289876", type: "hawker-centre" as const,
  latitude: 1.32413, longitude: 103.81416, foodStalls: 32, marketStalls: 0, description: "A hawker centre.", status: "Existing", photoUrl: null };
const payload = { page: 1, size: 25, total: 51, coverage: "NEA hawker centres; excludes private coffeeshops and food courts.",
  source: { agency: "NEA", datasetId, url: datasetUrl }, kopitiams: [centre] };
beforeEach(() => { jest.clearAllMocks(); jest.mocked(getKopitiams).mockResolvedValue(payload); });

test("shows hawker details, zero counts, coverage and a coordinate map link", async () => {
  render(await KopitiamPage({ searchParams: Promise.resolve({}) }));
  expect(getKopitiams).toHaveBeenCalledWith(1, 25, "");
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Find your next hawker stop");
  const card = screen.getByRole("article", { name: centre.name });
  for (const text of [centre.address, "32", "0", "Source status: Existing", centre.description]) {
    expect(within(card).getByText(text)).toBeInTheDocument();
  }
  expect(screen.getByText(/excludes private coffeeshops and food courts/)).toHaveTextContent("does not indicate whether a centre is open right now");
  const map = new URL(screen.getByRole("link", { name: `View ${centre.name} on map` }).getAttribute("href")!);
  expect(map.searchParams.get("query")).toBe("1.32413,103.81416");
  expect(screen.getByRole("link", { name: "About the dataset ↗" })).toHaveAttribute("href", datasetUrl);
});

test("preserves search in navigation and forms while resetting page for a new search", async () => {
  jest.mocked(getKopitiams).mockResolvedValue({ ...payload, page: 2, size: 10, total: 30 });
  render(await KopitiamPage({ searchParams: Promise.resolve({ page: "2", size: "10", name: "  Adam & Co  " }) }));
  expect(getKopitiams).toHaveBeenCalledWith(2, 10, "Adam & Co");
  expect(screen.getByRole("searchbox", { name: "Search hawker centre name" })).toHaveValue("Adam & Co");
  const search = screen.getByRole("search", { name: "Search hawker centre name" }) as HTMLFormElement;
  expect(new FormData(search).get("page")).toBe("1");
  expect(new FormData(search).get("size")).toBe("10");
  expect(search).toHaveAttribute("action", "/kopitiam");
  expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/kopitiam?page=3&size=10&name=Adam+%26+Co");
  expect(screen.getByRole("link", { name: "← Previous" })).toHaveAttribute("href", "/kopitiam?page=1&size=10&name=Adam+%26+Co");
  expect(screen.getByRole("link", { name: "Refresh ↻" })).toHaveAttribute("href", "/kopitiam?page=2&size=10&name=Adam+%26+Co");
  expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/kopitiam?page=1&size=10");
  for (const label of ["Per page", "Go to page"]) {
    expect(new FormData(screen.getByLabelText(label).closest("form")!).get("name")).toBe("Adam & Co");
  }
});

test("keeps searches in retry links and hides internal failures", async () => {
  jest.mocked(getKopitiams).mockRejectedValue(new Error("Private AWS message"));
  render(await KopitiamPage({ searchParams: Promise.resolve({ name: "Adam", page: "3", size: "10" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("Hawker centre data is temporarily unavailable");
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/kopitiam?page=3&size=10&name=Adam");
  expect(screen.queryByText(/Private AWS/)).not.toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Hawker centres" })).not.toBeInTheDocument();
});

test("shows a no-match state and preserves search when returning from an empty page", async () => {
  jest.mocked(getKopitiams).mockResolvedValue({ ...payload, total: 0, kopitiams: [] });
  const view = render(await KopitiamPage({ searchParams: Promise.resolve({ name: "Adam" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("No matching hawker centres");
  expect(screen.queryByLabelText("Go to page")).not.toBeInTheDocument();
  view.unmount();
  jest.mocked(getKopitiams).mockResolvedValue({ ...payload, page: 99, kopitiams: [] });
  render(await KopitiamPage({ searchParams: Promise.resolve({ name: "Adam", page: "99" }) }));
  expect(screen.getByRole("link", { name: "Return to page 1" })).toHaveAttribute("href", "/kopitiam?page=1&size=25&name=Adam");
  expect(screen.getByRole("navigation", { name: "Hawker centres pagination" })).toHaveTextContent("0 shown · 51 centres");
  expect(screen.queryByRole("link", { name: "Next →" })).not.toBeInTheDocument();
});

test("renders missing optional details without map links or misleading counts", async () => {
  jest.mocked(getKopitiams).mockResolvedValue({ ...payload, total: 1, kopitiams: [{ ...centre,
    latitude: null, longitude: null, foodStalls: null, marketStalls: null, description: null, status: null }] });
  render(await KopitiamPage({ searchParams: Promise.resolve({}) }));
  expect(within(screen.getByRole("article")).getAllByText("—")).toHaveLength(2);
  expect(screen.getByText("Source status: Not provided")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /on map/ })).not.toBeInTheDocument();
  expect(screen.queryByText("About this centre")).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Next →" })).not.toBeInTheDocument();
});

test.each([["Adam", "Market"], "a".repeat(257)])("validates bad search URLs before contacting Lambda: %j", async (name) => {
  render(await KopitiamPage({ searchParams: Promise.resolve({ name }) }));
  expect(getKopitiams).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("Enter one name of up to 256 characters");
});

test("announces loading", () => {
  render(<Loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading hawker centres");
});
