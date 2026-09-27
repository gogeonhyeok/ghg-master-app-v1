import { render, screen } from "@testing-library/react";
import CamelPage from "./page";

const originalFetch = global.fetch;
const feed = (count: number) => `<rss><channel>${Array.from({ length: count }, (_, i) => `<item><title>Post ${i + 1}</title><link>https://camel.apache.org/blog/post-${i + 1}</link><pubDate>invalid</pubDate><description><![CDATA[<p>Story ${i + 1}</p><script>alert(1)</script>]]></description></item>`).join("")}</channel></rss>`;
beforeEach(() => { global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => feed(18) }); });
afterEach(() => { global.fetch = originalFetch; });

test("paginates via URLs and renders safe excerpts", async () => {
  const { container } = render(await CamelPage({ searchParams: Promise.resolve({ page: "2" }) }));
  expect(screen.getAllByRole("article")).toHaveLength(8);
  expect(screen.getByRole("link", { name: /Post 9/ })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /^Post 1↗$/ })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute("href", "/camel?page=3#articles");
  expect(container.querySelector("script")).toBeNull();
  expect(container.querySelector("time")).toBeNull();
  expect(screen.queryByText(/alert\(1\)/)).not.toBeInTheDocument();
});

test.each(["0", "-3", "abc", "1.5"])("handles invalid page %s", async (page) => {
  render(await CamelPage({ searchParams: Promise.resolve({ page }) }));
  expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("← Previous")).toHaveAttribute("aria-disabled", "true");
});

test("clamps to the last page", async () => {
  render(await CamelPage({ searchParams: Promise.resolve({ page: "999" }) }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(screen.getByText("Next →")).toHaveAttribute("aria-disabled", "true");
});

test("handles an empty feed", async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: true, text: async () => feed(0) } as Response);
  render(await CamelPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("No articles yet.")).toBeInTheDocument();
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

test("handles a network failure", async () => {
  jest.mocked(fetch).mockRejectedValue(new Error("Offline"));
  render(await CamelPage({ searchParams: Promise.resolve({}) }));
  expect(screen.getByText("The feed is temporarily unavailable.")).toBeInTheDocument();
});
