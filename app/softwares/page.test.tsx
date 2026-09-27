import { fireEvent, render, screen, within } from "@testing-library/react";
import SoftwaresPage from "./page";
import catalog from "./softwares.json";

beforeEach(() => localStorage.clear());

test("displays all records, distinguishing unknown and zero prices", () => {
  render(<SoftwaresPage />);
  expect(screen.getByRole("status")).toHaveTextContent(`${catalog.length} of ${catalog.length} entries`);
  const unknown = screen.getByRole("heading", { name: "Office365 Home" }).closest("li")!;
  expect(within(unknown).getByText("Price not recorded")).toBeInTheDocument();
  const zero = screen.getByRole("heading", { name: "Microsoft SQL Server 2017 Developer" }).closest("li")!;
  expect(within(zero).getByText("0")).toBeInTheDocument();
});

test("combines search and filters and resets empty results", () => {
  render(<SoftwaresPage />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  WPF  " } });
  fireEvent.change(screen.getByLabelText("Manufacturer"), { target: { value: "Xceed" } });
  expect(screen.getByRole("status")).toHaveTextContent("3 of 45 entries");
  fireEvent.change(screen.getByLabelText("Currency"), { target: { value: "KRW" } });
  expect(screen.getByText("No matching software")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.getByRole("status")).toHaveTextContent("45 of 45 entries");
});

test("switches and restores theme preference", () => {
  const { container, unmount } = render(<SoftwaresPage />);
  expect(container.firstChild).toHaveAttribute("data-theme", "dark");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("softwares-theme")).toBe("light");
  unmount();
  expect(render(<SoftwaresPage />).container.firstChild).toHaveAttribute("data-theme", "light");
});
