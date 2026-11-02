import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { fireEvent, render, screen } from "@testing-library/react";
import TravelTheme, { ThemeToggle } from "./TravelTheme";

beforeEach(() => localStorage.clear());
afterEach(() => { jest.restoreAllMocks(); });

test("defaults to dark and shares the saved preference across destinations", () => {
  const first = render(<TravelTheme destination="korea"><ThemeToggle /></TravelTheme>);
  expect(first.container.firstChild).toHaveAttribute("data-theme", "dark");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(first.container.firstChild).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("travel-theme")).toBe("light");
  first.unmount();
  const second = render(<TravelTheme destination="taiwan"><ThemeToggle /></TravelTheme>);
  expect(second.container.firstChild).toHaveAttribute("data-theme", "light");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(second.container.firstChild).toHaveAttribute("data-theme", "dark");
});

test("still toggles when storage is blocked", () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
  const { container } = render(<TravelTheme destination="singapore"><ThemeToggle /></TravelTheme>);
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
});
