import { fireEvent, render, screen, within } from "@testing-library/react";
import { auth, isGoogleAuthConfigured } from "../auth";
import AppBar from "./AppBar";
import AppTheme from "./AppTheme";
import ThemeToggle from "./ThemeToggle";

jest.mock("../auth", () => ({
  auth: jest.fn(),
  isGoogleAuthConfigured: jest.fn(),
}));
jest.mock("../app/actions/auth", () => ({
  signInWithGoogle: jest.fn(),
  signOutOfAccount: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(true);
  jest.mocked(auth).mockResolvedValue(null as never);
});

test("offers Google sign-in in the main app bar for visitors", async () => {
  render(<AppTheme>{await AppBar()}</AppTheme>);
  const navigation = within(screen.getByRole("navigation", { name: "Main navigation" }));
  expect(navigation.getByRole("link", { name: "Go Gun Hyuk home" })).toHaveAttribute("href", "/");
  expect(navigation.getByRole("button", { name: "Sign in with Google" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
});

test("keeps the page available and disables login until credentials are configured", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(false);
  render(<AppTheme>{await AppBar()}</AppTheme>);
  expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeDisabled();
  expect(auth).not.toHaveBeenCalled();
});

test("shows the authenticated account and sign-out instead of Google sign-in", async () => {
  jest.mocked(auth).mockResolvedValue({ user: { name: "Alex Tan", email: "alex@example.test" } } as never);
  render(<AppTheme>{await AppBar()}</AppTheme>);
  expect(screen.getByText("Alex Tan")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Sign in with Google" })).not.toBeInTheDocument();
});

test("switches the app and login controls between themes and saves the preference", async () => {
  const { container, unmount } = render(<AppTheme>{await AppBar()}</AppTheme>);
  expect(container.firstChild).toHaveAttribute("data-theme", "dark");
  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  expect(container.firstChild).toHaveStyle({ colorScheme: "light" });
  expect(document.cookie).toContain("home-theme=light");
  expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeEnabled();
  unmount();

  // The server passes the saved cookie value into AppTheme on the next request.
  const restored = render(<AppTheme initialTheme="light">{await AppBar()}</AppTheme>);
  expect(restored.container.firstChild).toHaveAttribute("data-theme", "light");
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(restored.container.firstChild).toHaveAttribute("data-theme", "dark");
  expect(document.cookie).toContain("home-theme=dark");
});

test("keeps the shared theme and one app bar when the route content changes", async () => {
  const appBar = await AppBar();
  const { container, rerender } = render(
    <AppTheme>{appBar}<main>Home content</main></AppTheme>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

  rerender(<AppTheme>{appBar}<main>Child page content</main></AppTheme>);

  expect(screen.getByRole("main")).toHaveTextContent("Child page content");
  expect(screen.getAllByRole("navigation", { name: "Main navigation" })).toHaveLength(1);
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
});

test("connects the existing page theme controls to the new app bar", async () => {
  const { container } = render(
    <AppTheme>
      {await AppBar()}
      <section aria-label="Page theme controls"><ThemeToggle /></section>
    </AppTheme>,
  );
  const pageControls = within(screen.getByRole("region", { name: "Page theme controls" }));
  fireEvent.click(pageControls.getByRole("button", { name: "Switch to light mode" }));

  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  expect(document.documentElement).not.toHaveClass("dark");
  expect(localStorage.getItem("theme")).toBe("light");
  expect(document.cookie).toContain("home-theme=light");
  const navigation = within(screen.getByRole("navigation", { name: "Main navigation" }));
  fireEvent.click(navigation.getByRole("button", { name: "Switch to dark mode" }));
  expect(document.documentElement).toHaveClass("dark");
  expect(pageControls.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
});

test("restores an existing theme preference when there is no server cookie", async () => {
  localStorage.setItem("theme", "light");
  const { container, unmount } = render(<AppTheme>{await AppBar()}</AppTheme>);
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  unmount();

  const restored = render(<AppTheme initialTheme="dark">{await AppBar()}</AppTheme>);
  expect(restored.container.firstChild).toHaveAttribute("data-theme", "dark");
  expect(document.documentElement).toHaveClass("dark");
});
