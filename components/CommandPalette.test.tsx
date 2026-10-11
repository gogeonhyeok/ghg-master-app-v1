jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { CommandPaletteProvider, CommandPaletteTrigger } from "./CommandPalette";

const push = jest.fn();
const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  // jsdom does not implement the native dialog API.
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterAll(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

beforeEach(() => {
  push.mockClear();
  jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
});

function setup() {
  return render(<CommandPaletteProvider><CommandPaletteTrigger /></CommandPaletteProvider>);
}

test.each(["metaKey", "ctrlKey"])("opens, focuses search, and toggles closed with %s+K", (modifier) => {
  setup();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: "k", [modifier]: true });
  expect(screen.getByRole("dialog", { name: "Search projects" })).toBeInTheDocument();
  expect(screen.getByRole("combobox")).toHaveFocus();
  expect(screen.getAllByRole("option")).toHaveLength(15);
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "k", [modifier]: true });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("");
});

test("filters by name, description, and route with case-insensitive multi-word search", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /Search projects/ }));
  const input = screen.getByRole("combobox");
  for (const query of [" FAVICON ", "website icons", "/favicon"]) {
    fireEvent.change(input, { target: { value: query } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Favicon");
    expect(screen.getByRole("option")).toHaveAttribute("aria-selected", "true");
  }
  fireEvent.keyDown(input, { key: "Enter" });
  expect(push).toHaveBeenCalledWith("/favicon");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("navigates with arrows, wraps selection, and resets selection when filtering", () => {
  setup();
  fireEvent.keyDown(window, { key: "k", metaKey: true });
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Test");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Inventories");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Favicon");
  fireEvent.change(input, { target: { value: "inventory" } });
  expect(screen.getByRole("option", { selected: true })).toHaveTextContent("Inventories");
  expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option").id);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(push).toHaveBeenCalledWith("/inventories");
});

test.each(["camel", "softwares"])("searches this app's %s project", (project) => {
  setup();
  fireEvent.keyDown(window, { key: "k", metaKey: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: project } });
  expect(screen.getAllByRole("option")).toHaveLength(1);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(push).toHaveBeenCalledWith(`/${project}`);
});

test("allows clicking a project and restores the previous body scroll style", () => {
  document.body.style.overflow = "auto";
  setup();
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
  fireEvent.click(screen.getByRole("option", { name: /Favicon/ }));
  expect(push).toHaveBeenCalledWith("/favicon");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe("auto");
  document.body.style.overflow = "";
});

test("handles empty results and ignores navigation and Enter during IME composition", () => {
  setup();
  fireEvent.keyDown(window, { key: "k", metaKey: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "no-such-project" } });
  expect(screen.getByText(/No projects found/)).toBeInTheDocument();
  expect(input).not.toHaveAttribute("aria-activedescendant");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(push).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: "favicon" } });
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(push).not.toHaveBeenCalled();
});

test("dismisses via native Escape cancellation, close button, and backdrop; reopening clears search", () => {
  setup();
  const trigger = screen.getByRole("button", { name: /Search projects/ });
  fireEvent.click(trigger);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "favicon" } });
  fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(screen.getByRole("combobox")).toHaveValue("");
  fireEvent.click(screen.getByRole("button", { name: "Close command palette" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("dialog"), { clientX: -1, clientY: -1 });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("ignores shortcut repeats and cleans up scroll lock and listeners on unmount", () => {
  const view = setup();
  fireEvent.keyDown(window, { key: "k", metaKey: true, repeat: true });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: "k", metaKey: true });
  view.unmount();
  expect(document.body.style.overflow).toBe("");
  const shortcut = new KeyboardEvent("keydown", { key: "k", metaKey: true, cancelable: true });
  window.dispatchEvent(shortcut);
  expect(shortcut.defaultPrevented).toBe(false);
});
