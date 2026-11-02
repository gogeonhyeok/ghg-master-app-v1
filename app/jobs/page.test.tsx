import { expect, test } from "@jest/globals";
declare const jest: typeof import("@jest/globals").jest;
import "@testing-library/jest-dom/jest-globals";
jest.mock("./data", () => ({ getSingaporeJobs: jest.fn() }));

import { fireEvent, render, screen, within } from "@testing-library/react";
import JobsPage from "./page";
import { getSingaporeJobs } from "./data";
import JobsList from "./JobsList";
import JobsFilters from "./JobsFilters";
import JobsSort from "./JobsSort";
import { employers, parseFilters, type Job } from "./catalog";

const job: Job = { id: "stripe-1", title: "Software Engineer", company: "Stripe", employer: "stripe", location: "Singapore", url: "https://stripe.com/jobs/search?gh_jid=1", discipline: "software", date: "2026-10-10T00:00:00Z", dateLabel: "Posted" };
const sources = employers.map((employer) => ({ ...employer, available: true }));

test("renders real roles, source coverage, accessible filters, and original application links", async () => {
  jest.mocked(getSingaporeJobs).mockResolvedValue({ jobs: [job], sources });
  render(await JobsPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("heading", { name: "Singapore IT jobs", level: 1 })).toBeInTheDocument();
  const table = screen.getByRole("table", { name: /Singapore IT job opportunities/ });
  expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Role", "Company", "Specialism", "Location", "Date", "Action"]);
  const row = within(table).getAllByRole("row")[1];
  expect(within(row).getByRole("rowheader")).toHaveTextContent("Software Engineer");
  expect(within(row).getByText("Singapore")).toBeInTheDocument();
  expect(within(row).getByText("Posted")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Singapore IT job results" })).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("link", { name: /View Software Engineer at Stripe/ })).toHaveAttribute("href", job.url);
  expect(screen.getByLabelText("Search roles")).toHaveAttribute("name", "q");
  expect(screen.getByLabelText("Specialism")).toBeInTheDocument();
  expect(screen.getByText(/4 \/ 4 employer feeds available/)).toBeInTheDocument();
  expect(screen.getByText(/their listings are not included above/)).toBeInTheDocument();
});

test("shows an actionable empty state when filters match no roles", async () => {
  jest.mocked(getSingaporeJobs).mockResolvedValue({ jobs: [job], sources });
  render(await JobsPage({ searchParams: Promise.resolve({ q: "nonexistent" }) }));
  expect(screen.getByText("No roles found this time.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Clear all filters/ })).toHaveAttribute("href", "/jobs");
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("distinguishes an outage from no matching jobs and keeps external searches available", async () => {
  jest.mocked(getSingaporeJobs).mockResolvedValue({ jobs: [], sources: sources.map((source) => ({ ...source, available: false })) });
  render(await JobsPage({ searchParams: Promise.resolve({ employer: "stripe" }) }));
  expect(screen.getByRole("status")).toHaveTextContent("Job listings are temporarily unavailable.");
  expect(screen.queryByText("No roles found this time.")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Try again/ })).toHaveAttribute("href", "/jobs?employer=stripe");
  expect(screen.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("target", "_blank");
});

test("shows partial failures alongside the remaining jobs", async () => {
  jest.mocked(getSingaporeJobs).mockResolvedValue({ jobs: [job], sources: sources.map((source) => ({ ...source, available: source.token !== "datadog" })) });
  render(await JobsPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("status")).toHaveTextContent("Could not load Datadog.");
  expect(screen.getByRole("link", { name: /View Software Engineer at Stripe/ })).toBeInTheDocument();
});


test("mobile entries expose the original application link and expandable full location and date", () => {
  render(<JobsList jobs={[{ ...job, location: "Singapore; Sydney" }]} />);
  const list = screen.getByRole("list", { name: "Singapore IT job opportunities" });
  expect(within(list).getByRole("link", { name: /Software Engineer/ })).toHaveAttribute("href", job.url);
  expect(within(list).getByText("Stripe · Singapore")).toBeInTheDocument();
  const summary = within(list).getByText("Software engineering").closest("summary")!;
  const details = summary.closest("details")!;
  expect(details).not.toHaveAttribute("open");
  fireEvent.click(summary);
  expect(details).toHaveAttribute("open");
  expect(within(details).getByText("Singapore; Sydney")).toBeInTheDocument();
  expect(within(details).getByText("10 October 2026")).toBeInTheDocument();
});

test("filter disclosure shows active selections and preserves them when collapsed", () => {
  render(<JobsFilters filters={parseFilters({ employer: "stripe", discipline: "software", sort: "company", page: "2" })} />);
  const toggle = screen.getByRole("button", { name: /Filters \(2\)/ });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  fireEvent.change(screen.getByLabelText("Company"), { target: { value: "" } });
  expect(screen.getByRole("button", { name: /Filters \(1\)/ })).toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  const form = screen.getByRole("form", { name: "Filter jobs" }) as HTMLFormElement;
  expect(Object.fromEntries(new FormData(form))).toMatchObject({ employer: "", discipline: "software", sort: "company" });
  expect(new FormData(form).has("page")).toBe(false);
});

test("changing sort submits the applied search and filters and resets pagination", () => {
  render(<JobsSort filters={parseFilters({ q: "engineer", employer: "stripe", discipline: "software", page: "2" })} />);
  const form = screen.getByRole("form", { name: "Sort jobs" }) as HTMLFormElement;
  const submit = jest.spyOn(form, "requestSubmit").mockImplementation(() => {});
  fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "company" } });
  expect(submit).toHaveBeenCalledTimes(1);
  expect(Object.fromEntries(new FormData(form))).toEqual({ q: "engineer", employer: "stripe", discipline: "software", sort: "company" });
  submit.mockRestore();
});
