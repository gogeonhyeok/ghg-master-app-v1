import { fireEvent, render, screen, within } from "@testing-library/react";
import Kamponglah from "./Kamponglah";
import { STORAGE_KEY } from "./data";
import { COMMENTS_STORAGE_KEY } from "./comments";

beforeEach(() => { localStorage.clear(); jest.restoreAllMocks(); });

test("provides keyboard address autocomplete in one text input and reorders recommendations", () => {
  render(<Kamponglah />);
  const input = screen.getByRole("textbox", { name: "Your daily complaint" });
  fireEvent.change(input, { target: { value: "Noise here #485 segar", selectionStart: 20 } });
  expect(screen.getByRole("option", { name: /485 Segar Road/ })).toBeInTheDocument();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("Noise here #485SegarRoad ");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(screen.getAllByRole("textbox")).toHaveLength(1);
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Noise · 485 Segar Road");
});

test("stores, restores and deletes a local post without claiming it was published", () => {
  const view = render(<Kamponglah />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Power is off again #Tampines", selectionStart: 28 } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(screen.getByText("Saved in this browser.")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0]).toMatchObject({ text: "Power is off again #Tampines", area: "Tampines", topic: "Blackout" });
  view.unmount();
  render(<Kamponglah />);
  const ownPost = screen.getAllByRole("article").find((article) => within(article).queryByText("Your post · this browser"))!;
  expect(ownPost).toHaveTextContent("Power is off again");
  fireEvent.click(within(ownPost).getByRole("button", { name: /Delete your post/ }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([]);
});

test("requests location only on click and falls back to topic matching when denied", () => {
  const getCurrentPosition = jest.fn((_success, error) => error({ code: 1 }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  expect(screen.getByText("Location off. Try an area hashtag.")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "power outage" } });
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
});

test("uses approximate location, allows a hashtag override and can clear location", () => {
  const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 1.354, longitude: 103.945 } }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "#485SegarRoad" } });
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Noise · 485 Segar Road");
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(within(screen.getByRole("region", { name: "Highlights around you" })).getByText("Bukit Panjang")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear location" }));
  expect(screen.getByRole("button", { name: "Use my location" })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].area).toBe("Bukit Panjang");
});

test("keeps sharing functional if storage is blocked, and rejects blank submissions", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
  render(<Kamponglah />);
  expect(screen.getByRole("button", { name: "Let it out" })).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } });
  expect(screen.getByRole("button", { name: "Let it out" })).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "A noisy evening" } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(screen.getByText(/this change lasts for this visit only/)).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(7);
});

test("switches light and dark themes and restores the saved preference", () => {
  const view = render(<Kamponglah />);
  const toggle = screen.getByRole("button", { name: "Dark mode" });
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("main")).toHaveAttribute("data-theme", "light");
  fireEvent.click(toggle);
  expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("kamponglah-theme")).toBe("dark");
  view.unmount();
  render(<Kamponglah />);
  expect(screen.getByRole("button", { name: "Dark mode" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  expect(screen.getByRole("main")).toHaveAttribute("data-theme", "light");
});

test("searches contents and hashtags in one field with clear and no-match states", () => {
  render(<Kamponglah />);
  const search = screen.getByRole("searchbox", { name: "Search complaints or hashtags" });
  expect(screen.getAllByRole("searchbox")).toHaveLength(1);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  fireEvent.change(search, { target: { value: "bowling" } });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Noise · 485 Segar Road");
  fireEvent.change(search, { target: { value: "power #tampines" } });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
  fireEvent.change(search, { target: { value: "no matching complaint" } });
  expect(screen.getByRole("status")).toHaveTextContent("No complaints found.");
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(search).toHaveValue("");
  expect(screen.getAllByRole("article")).toHaveLength(6);
});

test("shows only local highlights without repeating them in the main list", () => {
  const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 1.388, longitude: 103.772 } }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  const highlights = screen.getByRole("region", { name: "Highlights around you" });
  expect(within(highlights).getAllByRole("article")).toHaveLength(3);
  expect(within(highlights).getByText("Bukit Panjang")).toBeInTheDocument();
  expect(within(highlights).queryByRole("article", { name: "Blackout · Tampines" })).not.toBeInTheDocument();
  const rest = screen.getByRole("region", { name: "More complaints" });
  expect(within(rest).getAllByRole("article")).toHaveLength(3);
  expect(within(rest).queryByRole("article", { name: "Noise · 485 Segar Road" })).not.toBeInTheDocument();

  // Search covers all areas in one result list even when location is set.
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "#Tampines" } });
  expect(screen.queryByRole("region", { name: "Highlights around you" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
});

test("does not label distant posts as nearby when location is absent or there are no area matches", () => {
  const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 1.437, longitude: 103.786 } }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  const highlights = screen.getByRole("region", { name: "Highlights around you" });
  expect(getCurrentPosition).not.toHaveBeenCalled();
  expect(within(highlights).getByText("Use your location or add an area hashtag.")).toBeInTheDocument();
  expect(within(highlights).queryByRole("article")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  expect(within(highlights).getByText("Woodlands")).toBeInTheDocument();
  expect(within(highlights).queryByRole("article")).not.toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(6);
});

test("uses an area hashtag for highlights without location permission and retains it after sharing", () => {
  const getCurrentPosition = jest.fn();
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "Noisy again #485SegarRoad" } });
  const highlights = screen.getByRole("region", { name: "Highlights around you" });
  expect(within(highlights).getAllByRole("article")).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(within(highlights).getByText("Bukit Panjang")).toBeInTheDocument();
  expect(within(highlights).getByText("Your post · this browser")).toBeInTheDocument();
  expect(getCurrentPosition).not.toHaveBeenCalled();
});

test("adds and restores comments on the right complaint across search and nearby highlights", () => {
  const view = render(<Kamponglah />);
  const post = screen.getByRole("article", { name: "Noise · 485 Segar Road" });
  const toggle = within(post).getByRole("button", { name: "Comment" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  const input = within(post).getByRole("textbox", { name: "Your comment" });
  expect(input).toHaveAttribute("maxlength", "400");
  expect(within(post).getByRole("button", { name: "Reply" })).toBeDisabled();
  fireEvent.change(input, { target: { value: "   " } });
  expect(within(post).getByRole("button", { name: "Reply" })).toBeDisabled();
  fireEvent.change(input, { target: { value: "  Same here, can hear from downstairs.  " } });
  fireEvent.click(within(post).getByRole("button", { name: "Reply" }));
  expect(input).toHaveValue("");
  expect(within(post).getByText("Same here, can hear from downstairs.")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)[0]).toMatchObject({ postId: "sample-1", text: "Same here, can hear from downstairs." });
  fireEvent.click(within(post).getByRole("button", { name: "1 comment" }));
  expect(within(post).queryByRole("textbox")).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "#Tampines" } });
  expect(screen.queryByRole("button", { name: "1 comment" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "#485SegarRoad" } });
  expect(within(screen.getByRole("region", { name: "Highlights around you" })).getByRole("button", { name: "1 comment" })).toBeInTheDocument();
  view.unmount();
  render(<Kamponglah />);
  const restored = screen.getByRole("article", { name: "Noise · 485 Segar Road" });
  fireEvent.click(within(restored).getByRole("button", { name: "1 comment" }));
  expect(within(restored).getByText("Same here, can hear from downstairs.")).toBeInTheDocument();
  fireEvent.click(within(restored).getByRole("button", { name: /Delete your comment/ }));
  expect(within(restored).getByRole("button", { name: "Comment" })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)).toEqual([]);
});

test("removes a local complaint's comments when the complaint is deleted", () => {
  render(<Kamponglah />);
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "Lift is noisy again" } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  const post = screen.getAllByRole("article").find((article) => within(article).queryByText("Your post · this browser"))!;
  fireEvent.click(within(post).getByRole("button", { name: "Comment" }));
  fireEvent.change(within(post).getByRole("textbox", { name: "Your comment" }), { target: { value: "Happened yesterday too." } });
  fireEvent.click(within(post).getByRole("button", { name: "Reply" }));
  fireEvent.click(within(post).getByRole("button", { name: /Delete your post/ }));
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)).toEqual([]);
});

test("keeps comments usable for this visit when browser storage is blocked", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
  render(<Kamponglah />);
  const post = screen.getByRole("article", { name: "Blackout · Tampines" });
  fireEvent.click(within(post).getByRole("button", { name: "Comment" }));
  fireEvent.change(within(post).getByRole("textbox"), { target: { value: "Our power is back." } });
  fireEvent.click(within(post).getByRole("button", { name: "Reply" }));
  expect(within(post).getByText("Our power is back.")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("this change lasts for this visit only");
  fireEvent.click(within(post).getByRole("button", { name: /Delete your comment/ }));
  expect(within(post).queryByText("Our power is back.")).not.toBeInTheDocument();
});

test("uses and preserves the signed-in name on complaints and comments after logout", () => {
  const view = render(<Kamponglah userName="Alex Tan" />);
  expect(screen.getByRole("checkbox", { name: "Anonymous" })).not.toBeChecked();
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "Noisy lift again" } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  const post = screen.getAllByRole("article").find((article) => within(article).queryByText("Your post · this browser"))!;
  expect(within(post).getByText("Alex Tan")).toBeInTheDocument();
  fireEvent.click(within(post).getByRole("button", { name: "Comment" }));
  fireEvent.change(within(post).getByRole("textbox", { name: "Your comment" }), { target: { value: "Lift is fixed now." } });
  fireEvent.click(within(post).getByRole("button", { name: "Reply" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Alex Tan");
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)[0].author).toBe("Alex Tan");
  view.unmount();
  render(<Kamponglah />);
  const restored = screen.getAllByRole("article").find((article) => within(article).queryByText("Your post · this browser"))!;
  expect(within(restored).getByText("Alex Tan")).toBeInTheDocument();
  fireEvent.click(within(restored).getByRole("button", { name: "1 comment" }));
  expect(within(restored).getAllByText("Alex Tan")).toHaveLength(2);
  expect(screen.queryByRole("checkbox", { name: "Anonymous" })).not.toBeInTheDocument();
});

test("stores no Google name when posting anonymously, including replies", () => {
  render(<Kamponglah userName="Alex Tan" />);
  const composer = screen.getByRole("region", { name: "Write a complaint" });
  fireEvent.click(within(composer).getByRole("checkbox", { name: "Anonymous" }));
  fireEvent.change(within(composer).getByRole("textbox"), { target: { value: "Noisy night #485SegarRoad" } });
  fireEvent.click(within(composer).getByRole("button", { name: "Let it out" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Someone from the west");
  const post = screen.getAllByRole("article").find((article) => within(article).queryByText("Your post · this browser"))!;
  fireEvent.click(within(post).getByRole("button", { name: "Comment" }));
  fireEvent.click(within(post).getByRole("checkbox", { name: "Anonymous" }));
  fireEvent.change(within(post).getByRole("textbox"), { target: { value: "Quiet at last." } });
  fireEvent.click(within(post).getByRole("button", { name: "Reply" }));
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)[0].author).toBe("Someone from the west");
  expect(localStorage.getItem(STORAGE_KEY)).not.toContain("Alex Tan");
  expect(localStorage.getItem(COMMENTS_STORAGE_KEY)).not.toContain("Alex Tan");
  expect(screen.queryByText("Alex Tan")).not.toBeInTheDocument();
  expect(within(composer).getByRole("checkbox", { name: "Anonymous" })).toBeChecked();
  fireEvent.click(within(composer).getByRole("checkbox", { name: "Anonymous" }));
  fireEvent.change(within(composer).getByRole("textbox"), { target: { value: "Another post" } });
  fireEvent.click(within(composer).getByRole("button", { name: "Let it out" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Alex Tan");
});

test("uses guest location for authors without borrowing a complaint author's area", () => {
  const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 1.354, longitude: 103.945 } }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  render(<Kamponglah />);
  const composer = screen.getByRole("region", { name: "Write a complaint" });
  expect(screen.queryByRole("checkbox", { name: "Anonymous" })).not.toBeInTheDocument();
  fireEvent.change(within(composer).getByRole("textbox"), { target: { value: "Noise with no location" } });
  fireEvent.click(within(composer).getByRole("button", { name: "Let it out" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Wanderer");
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  fireEvent.change(within(composer).getByRole("textbox"), { target: { value: "Power is out here" } });
  fireEvent.click(within(composer).getByRole("button", { name: "Let it out" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Someone from the east");
  const westPost = screen.getByRole("article", { name: "Noise · 485 Segar Road" });
  fireEvent.click(within(westPost).getByRole("button", { name: "Comment" }));
  fireEvent.change(within(westPost).getByRole("textbox"), { target: { value: "Happens here too." } });
  fireEvent.click(within(westPost).getByRole("button", { name: "Reply" }));
  expect(JSON.parse(localStorage.getItem(COMMENTS_STORAGE_KEY)!)[0].author).toBe("Someone from the east");
});

test("anonymous signed-in posting with no area uses Wanderer and legacy posts never take the viewer's name", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: "local-old", text: "Old complaint", area: "Woodlands", place: null, topic: "Noise", createdAt: 10 }]));
  render(<Kamponglah userName="Alex Tan" />);
  expect(within(screen.getByRole("article", { name: "Noise · Singapore" })).getByText("Someone from the north")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Anonymous" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "A new anonymous complaint" } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)[0].author).toBe("Wanderer");
  expect(screen.queryByText("Alex Tan")).not.toBeInTheDocument();
});

test("shows Singapore timestamps for every complaint and preserves a local post's time after refresh", () => {
  jest.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-10T17:05:00Z"));
  const view = render(<Kamponglah />);
  expect(document.querySelectorAll("article time")).toHaveLength(6);
  fireEvent.change(screen.getByRole("textbox", { name: "Your daily complaint" }), { target: { value: "Late drilling #485SegarRoad" } });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  const time = screen.getByText("11 Nov 2026, 1:05 am");
  expect(time.tagName).toBe("TIME");
  expect(time).toHaveAttribute("datetime", "2026-11-10T17:05:00.000Z");
  expect(time).toHaveAttribute("title", "11 Nov 2026, 1:05 am SGT");
  expect(within(screen.getByRole("region", { name: "Highlights around you" })).getByText("11 Nov 2026, 1:05 am")).toBeInTheDocument();
  view.unmount();
  render(<Kamponglah />);
  expect(screen.getByText("11 Nov 2026, 1:05 am")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Late drilling" } });
  expect(within(screen.getByRole("region", { name: "Search results" })).getByText("11 Nov 2026, 1:05 am")).toBeInTheDocument();
});
