import { fireEvent, render, screen, within } from "@testing-library/react";
import SegarPage from "./page";

test("searches names, dishes and locations, and clears an empty result", () => {
  render(<SegarPage />);
  const food = within(screen.getByRole("region", { name: "Food options" }));
  const search = food.getByRole("searchbox");
  expect(food.getAllByRole("listitem")).toHaveLength(5);
  fireEvent.change(search, { target: { value: "  FAJAR   biryani  " } });
  expect(food.getAllByRole("listitem")).toHaveLength(1);
  expect(food.getByRole("heading", { name: "An-Nur Shentonway Famous" })).toBeInTheDocument();
  fireEvent.change(search, { target: { value: "bread garden" } });
  expect(food.getByRole("heading", { name: "Bread Garden" })).toBeInTheDocument();
  expect(food.getAllByRole("listitem")).toHaveLength(1);
  fireEvent.change(search, { target: { value: "no-such-place" } });
  expect(food.queryAllByRole("listitem")).toHaveLength(0);
  expect(food.getByRole("status")).toHaveTextContent("0 of 5 places");
  expect(food.getByText(/No matching places/)).toBeInTheDocument();
  fireEvent.click(food.getByRole("button", { name: "Clear search" }));
  expect(search).toHaveValue("");
  expect(food.getAllByRole("listitem")).toHaveLength(5);
});

test("medical search is independent of food search and supports clearing", () => {
  render(<SegarPage />);
  const medical = within(screen.getByRole("region", { name: "Medical options" }));
  const food = within(screen.getByRole("region", { name: "Food options" }));
  const search = medical.getByRole("searchbox");
  fireEvent.change(search, { target: { value: " FAJAR " } });
  expect(medical.getAllByRole("listitem")).toHaveLength(1);
  expect(medical.getByRole("heading", { name: "Healthway Medical (Fajar)" })).toBeInTheDocument();
  expect(medical.getByRole("link", { name: "Call +65 6769 0600" })).toHaveAttribute("href", "tel:+6567690600");
  expect(food.getAllByRole("listitem")).toHaveLength(5);
  fireEvent.change(search, { target: { value: "no-match" } });
  expect(medical.getByRole("status")).toHaveTextContent("0 of 3 places");
  fireEvent.click(medical.getByRole("button", { name: "Clear search" }));
  expect(medical.getAllByRole("listitem")).toHaveLength(3);
});

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

function setup() {
  return render(<SegarPage />);
}

test("defaults to dark and saves a light-mode choice", () => {
  const { container } = setup();
  const toggle = screen.getByRole("button", { name: "Dark mode" });
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "dark");
  fireEvent.click(toggle);
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "light");
  expect(localStorage.getItem("segar-theme")).toBe("light");
  fireEvent.click(toggle);
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "dark");
});

test("restores an explicitly saved light preference", () => {
  localStorage.setItem("segar-theme", "light");
  const { container } = setup();
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "light");
  expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "false");
});

test("works when browser storage is unavailable", () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Unavailable"); });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Unavailable"); });
  const { container } = setup();
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "dark");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.firstChild).toHaveAttribute("data-segar-theme", "light");
});
