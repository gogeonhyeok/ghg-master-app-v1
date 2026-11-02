import { beforeEach, expect, test } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { fireEvent, render, screen, within } from "@testing-library/react";
import TravelPage, { generateMetadata } from "./page";
import nextConfig from "../../next.config";
import { projects } from "../projects";

beforeEach(() => localStorage.clear());

test.each([
  ["korea", "Korea", "Seoul", "Bibimbap"],
  ["taiwan", "Taiwan", "Taipei", "Bubble tea"],
  ["singapore", "Singapore", "Marina Bay", "Laksa"],
])("renders the %s guide from its shareable travel URL", async (slug, name, place, food) => {
  const searchParams = Promise.resolve({ destination: slug });
  const { container } = render(await TravelPage({ searchParams }));
  expect(screen.getByRole("heading", { level: 1, name: new RegExp(name) })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: place })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: food })).toBeInTheDocument();
  expect(container.firstChild).toHaveAttribute("data-destination", slug);
  const nav = within(screen.getByRole("navigation", { name: "Destinations" }));
  expect(nav.getByRole("link", { name })).toHaveAttribute("aria-current", "page");
  for (const [country, label] of [["korea", "Korea"], ["taiwan", "Taiwan"], ["singapore", "Singapore"]]) {
    expect(nav.getByRole("link", { name: label })).toHaveAttribute("href", `/travel?destination=${country}`);
  }
  expect(screen.getByRole("link", { name: /elsewhere.*travel notes/ })).toHaveAttribute("href", "/travel");
  expect(await generateMetadata({ searchParams })).toEqual({ title: `${name} | Elsewhere Travel`, description: expect.any(String) });
});

test.each([undefined, "unknown", "toString", []])("defaults safely to Korea for destination %j", async (destination) => {
  render(await TravelPage({ searchParams: Promise.resolve({ destination }) }));
  expect(screen.getByRole("heading", { level: 1, name: /Korea/ })).toBeInTheDocument();
});

test("uses the first repeated selection and keeps the theme when the country changes", async () => {
  const first = await TravelPage({ searchParams: Promise.resolve({ destination: ["taiwan", "korea"] }) });
  const view = render(first);
  expect(view.container.firstChild).toHaveAttribute("data-destination", "taiwan");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  view.rerender(await TravelPage({ searchParams: Promise.resolve({ destination: "singapore" }) }));
  expect(view.container.firstChild).toHaveAttribute("data-destination", "singapore");
  expect(view.container.firstChild).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("travel-theme")).toBe("light");
});

test("replaces the country project links with Travel and redirects existing bookmarks", async () => {
  expect(projects.filter(({ href }) => href === "/travel")).toHaveLength(1);
  expect(projects.some(({ href }) => ["/korea", "/taiwan", "/singapore"].includes(href))).toBe(false);
  const redirects = await nextConfig.redirects?.();
  expect(redirects).toEqual(expect.arrayContaining(["korea", "taiwan", "singapore"].map((country) => ({
    source: `/${country}`, destination: `/travel?destination=${country}`, permanent: true,
  }))));
});
