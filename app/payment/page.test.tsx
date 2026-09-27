import { fireEvent, render, screen, within } from "@testing-library/react";
import PaymentPage from "./page";
const originalFetch = global.fetch;
const xml = (count: number) => `<rss><channel>${Array.from({ length: count }, (_, i) => `<item><title>Stripe post ${i + 1}</title><link>https://stripe.com/blog/post-${i + 1}</link><description><![CDATA[<p>News</p><script>alert(1)</script>]]></description></item>`).join("")}</channel></rss>`;
beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => xml(14) });
});
afterEach(() => { global.fetch = originalFetch; });

test("fetches RSS on the server and paginates without another request", async () => {
  const { container } = render(await PaymentPage());
  expect(fetch).toHaveBeenCalledWith("https://stripe.com/blog/feed.rss", expect.objectContaining({ next: { revalidate: 3600 } }));
  const blog = within(screen.getByRole("region", { name: "Ideas behind the payments." }));
  expect(blog.getAllByRole("article")).toHaveLength(6);
  expect(blog.getByRole("button", { name: "← Previous" })).toBeDisabled();
  fireEvent.click(blog.getByRole("button", { name: "Next →" }));
  expect(blog.getByText("Stripe post 7")).toBeInTheDocument();
  fireEvent.click(blog.getByRole("button", { name: "Page 3" }));
  expect(blog.getAllByRole("article")).toHaveLength(2);
  expect(blog.getByRole("button", { name: "Next →" })).toBeDisabled();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(container.querySelector("script")).toBeNull();
  expect(screen.queryByText(/alert\(1\)/)).not.toBeInTheDocument();
});

test("keeps the theme toggle interactive", async () => {
  const { container, unmount } = render(await PaymentPage());
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(container.firstChild).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("payment-theme")).toBe("light");
  unmount();
  expect(render(await PaymentPage()).container.firstChild).toHaveAttribute("data-theme", "light");
});

test("renders upstream errors with a reload link", async () => {
  jest.mocked(fetch).mockRejectedValueOnce(new Error("Offline"));
  render(await PaymentPage());
  expect(screen.getByText("Stripe updates are temporarily unavailable.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute("href", "/payment#stripe-updates");
});

test("handles empty feeds", async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: true, text: async () => xml(0) } as Response);
  render(await PaymentPage());
  expect(screen.getByText("No articles available yet.")).toBeInTheDocument();
});

test("excludes links outside Stripe", async () => {
  jest.mocked(fetch).mockResolvedValue({ ok: true, text: async () => '<rss><channel><item><title>Unsafe</title><link>javascript:alert(1)</link></item></channel></rss>' } as Response);
  render(await PaymentPage());
  expect(screen.queryByText("Unsafe")).not.toBeInTheDocument();
});
