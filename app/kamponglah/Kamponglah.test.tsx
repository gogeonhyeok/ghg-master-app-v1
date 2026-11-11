import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Kamponglah from "./Kamponglah";
import * as actions from "./actions";
import { sampleComplaints } from "./fixtures";
import { searchComplaints } from "./data";
import type { Snapshot } from "./types";

jest.mock("./actions", () => ({ loadComplaints: jest.fn(), postComplaint: jest.fn(), deleteComplaint: jest.fn(), postComment: jest.fn(), deleteComment: jest.fn(), voteComplaint: jest.fn(), updateTheme: jest.fn() }));
let snapshot: Snapshot;
const post = () => screen.getByRole("article", { name: "Noise · 485 Segar Road" });
const composer = () => screen.getByRole("textbox", { name: "Your daily complaint" });
async function open(userName?: string) {
  const view = render(<Kamponglah userName={userName} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Dark mode" })).toBeEnabled());
  return view;
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  snapshot = { posts: sampleComplaints.map((post) => ({ ...post })), comments: [], votes: {}, totals: { "sample-1": { like: 4, dislike: 1 } }, theme: "light" };
  jest.mocked(actions.loadComplaints).mockImplementation(async (view = {}) => ({ ok: true, data: { ...snapshot, posts: searchComplaints(snapshot.posts.filter((post) => !view.filter || view.filter === "All" || view.filter === post.topic), view.query ?? "") } }));
  for (const action of [actions.postComplaint, actions.deleteComplaint, actions.postComment, actions.deleteComment, actions.voteComplaint, actions.updateTheme]) jest.mocked(action).mockResolvedValue({ ok: true, data: undefined });
});

test("loads shared records without reading or writing local storage and keeps one list", async () => {
  const read = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw Error("must not read"); });
  const write = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw Error("must not write"); });
  await open();
  expect(screen.getAllByRole("article")).toHaveLength(6);
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  expect(screen.queryByText(/Demo|this browser|Sample post/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Delete your post/ })).not.toBeInTheDocument();
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
  expect(actions.loadComplaints).toHaveBeenCalledWith({ query: "", filter: "All", area: null });
});

test("posts through the server, preserves a failed draft and waits for confirmation", async () => {
  await open("Alex Tan");
  fireEvent.click(screen.getByRole("checkbox", { name: "Anonymous" }));
  fireEvent.change(composer(), { target: { value: "Noisy lift #485SegarRoad" } });
  jest.mocked(actions.postComplaint).mockResolvedValueOnce({ ok: false, error: "Database unavailable" });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  expect(screen.getByRole("button", { name: "Let it out" })).toBeDisabled();
  await screen.findByText("Database unavailable");
  expect(composer()).toHaveValue("Noisy lift #485SegarRoad");
  expect(screen.getAllByRole("article")).toHaveLength(6);
  jest.mocked(actions.postComplaint).mockImplementationOnce(async () => {
    snapshot = { ...snapshot, posts: [{ ...sampleComplaints[0], id: "new", text: "Noisy lift #485SegarRoad", canDelete: true, author: "Someone from the west" }, ...snapshot.posts] };
    return { ok: true, data: undefined };
  });
  fireEvent.click(screen.getByRole("button", { name: "Let it out" }));
  await waitFor(() => expect(composer()).toHaveValue(""));
  expect(actions.postComplaint).toHaveBeenLastCalledWith({ text: "Noisy lift #485SegarRoad", area: "Bukit Panjang", anonymous: true });
  expect(screen.getByText("Your post")).toBeInTheDocument();
  expect(screen.getByText("Your post").closest("article")).toHaveTextContent("Someone from the west");
  expect(screen.queryByText("Alex Tan")).not.toBeInTheDocument();
});

test("shows community vote totals and confirms switching and undo through MongoDB actions", async () => {
  await open();
  jest.mocked(actions.voteComplaint).mockImplementation(async (_id, choice) => {
    snapshot = { ...snapshot, votes: choice ? { "sample-1": choice } : {}, totals: { "sample-1": { like: 4 + Number(choice === "like"), dislike: 1 + Number(choice === "dislike") } } };
    return { ok: true, data: undefined };
  });
  fireEvent.click(within(post()).getByRole("button", { name: "Like 4" }));
  await waitFor(() => expect(within(post()).getByRole("button", { name: "Like 5" })).toBeEnabled());
  expect(within(post()).getByRole("button", { name: "Like 5" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(within(post()).getByRole("button", { name: "Dislike 1" }));
  await waitFor(() => expect(within(post()).getByRole("button", { name: "Dislike 2" })).toBeEnabled());
  expect(within(post()).getByRole("button", { name: "Like 4" })).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(within(post()).getByRole("button", { name: "Dislike 2" }));
  await waitFor(() => expect(within(post()).getByRole("button", { name: "Dislike 1" })).toBeEnabled());
  expect(jest.mocked(actions.voteComplaint).mock.calls).toEqual([["sample-1", "like"], ["sample-1", "dislike"], ["sample-1", null]]);
  jest.mocked(actions.voteComplaint).mockResolvedValueOnce({ ok: false, error: "Vote failed" });
  fireEvent.click(within(post()).getByRole("button", { name: "Like 4" }));
  await screen.findByText("Vote failed");
  expect(within(post()).getByRole("button", { name: "Like 4" })).toHaveAttribute("aria-pressed", "false");
});

test("comments use confirmed shared data, preserve failed replies and restrict delete controls", async () => {
  snapshot.comments = [{ id: "other", postId: "sample-1", text: "Another resident", author: "Mei", createdAt: 100, canDelete: false }];
  await open("Alex Tan");
  fireEvent.click(within(post()).getByRole("button", { name: "1 comment" }));
  expect(within(post()).queryByRole("button", { name: /Delete your comment/ })).not.toBeInTheDocument();
  const reply = within(post()).getByRole("textbox", { name: "Your comment" });
  fireEvent.change(reply, { target: { value: "Same here" } });
  fireEvent.click(within(post()).getByRole("checkbox", { name: "Anonymous" }));
  jest.mocked(actions.postComment).mockResolvedValueOnce({ ok: false, error: "Reply failed" });
  fireEvent.click(within(post()).getByRole("button", { name: "Reply" }));
  await screen.findByText("Reply failed");
  expect(reply).toHaveValue("Same here");
  jest.mocked(actions.postComment).mockImplementationOnce(async () => {
    snapshot = { ...snapshot, comments: [...snapshot.comments, { id: "own", postId: "sample-1", text: "Same here", createdAt: 200, author: "Wanderer", canDelete: true }] };
    return { ok: true, data: undefined };
  });
  fireEvent.click(within(post()).getByRole("button", { name: "Reply" }));
  await waitFor(() => expect(reply).toHaveValue(""));
  expect(actions.postComment).toHaveBeenLastCalledWith("sample-1", { text: "Same here", area: null, anonymous: true });
  jest.mocked(actions.deleteComment).mockImplementationOnce(async () => {
    snapshot = { ...snapshot, comments: snapshot.comments.filter((comment) => comment.id !== "own") };
    return { ok: true, data: undefined };
  });
  fireEvent.click(within(post()).getByRole("button", { name: /Delete your comment/ }));
  await waitFor(() => expect(within(post()).queryByText("Same here")).not.toBeInTheDocument());
  expect(within(post()).getByText("Another resident")).toBeInTheDocument();
});

test("deletes only an owned post after server confirmation", async () => {
  snapshot.posts[0].canDelete = true;
  await open();
  jest.mocked(actions.deleteComplaint).mockResolvedValueOnce({ ok: false, error: "Delete failed" });
  fireEvent.click(within(post()).getByRole("button", { name: /Delete your post/ }));
  await screen.findByText("Delete failed");
  expect(post()).toBeInTheDocument();
  jest.mocked(actions.deleteComplaint).mockImplementationOnce(async () => {
    snapshot = { ...snapshot, posts: snapshot.posts.slice(1) };
    return { ok: true, data: undefined };
  });
  fireEvent.click(within(post()).getByRole("button", { name: /Delete your post/ }));
  await waitFor(() => expect(screen.queryByRole("article", { name: "Noise · 485 Segar Road" })).not.toBeInTheDocument());
});

test("searches contents and hashtags through the server with topic tabs and no-match states", async () => {
  await open();
  const search = screen.getByRole("searchbox");
  fireEvent.change(search, { target: { value: "power #Tampines" } });
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith({ query: "power #Tampines", filter: "All", area: null }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
  fireEvent.change(search, { target: { value: "no matches here" } });
  await screen.findByText("No complaints found.");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
  fireEvent.click(within(screen.getByRole("group", { name: "Filter complaints" })).getByRole("button", { name: "Noise" }));
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith({ query: "", filter: "Noise", area: null }));
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

test("restores the database theme and only changes it after a successful save", async () => {
  snapshot.theme = "dark";
  await open();
  expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
  jest.mocked(actions.updateTheme).mockResolvedValueOnce({ ok: false, error: "Theme failed" });
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  await screen.findByText("Theme failed");
  expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
  jest.mocked(actions.updateTheme).mockImplementationOnce(async (theme) => { snapshot = { ...snapshot, theme }; return { ok: true, data: undefined }; });
  fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));
  await waitFor(() => expect(screen.getByRole("main")).toHaveAttribute("data-theme", "light"));
  expect(actions.updateTheme).toHaveBeenLastCalledWith("light");
});

test("shows an honest load failure with retry and no sample or local fallback", async () => {
  jest.mocked(actions.loadComplaints).mockResolvedValueOnce({ ok: false, error: "Database unavailable" });
  render(<Kamponglah />);
  await screen.findByText("Database unavailable");
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
  expect(screen.queryByText("Wah, so peaceful.")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Let it out" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findAllByRole("article");
});

test("ignores a stale server response after the search changes", async () => {
  await open();
  let finish: (value: Awaited<ReturnType<typeof actions.loadComplaints>>) => void;
  jest.mocked(actions.loadComplaints).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "bowling" } });
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith(expect.objectContaining({ query: "bowling" })));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "power" } });
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith(expect.objectContaining({ query: "power" })));
  await act(async () => { finish!({ ok: true, data: { ...snapshot, posts: [sampleComplaints[0]] } }); });
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Blackout · Tampines");
});

test("preserves keyboard hashtag completion and only requests location on click", async () => {
  const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 1.354, longitude: 103.945 } }));
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  await open();
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith(expect.objectContaining({ area: "Tampines" })));
  fireEvent.change(composer(), { target: { value: "Noise #485 segar", selectionStart: 16 } });
  expect(screen.getByRole("option", { name: /485 Segar Road/ })).toBeInTheDocument();
  fireEvent.keyDown(composer(), { key: "Enter" });
  expect(composer()).toHaveValue("Noise #485SegarRoad ");
  await waitFor(() => expect(actions.loadComplaints).toHaveBeenLastCalledWith(expect.objectContaining({ area: "Bukit Panjang" })));
  expect(screen.getAllByRole("article")).toHaveLength(6);
  expect(screen.getAllByRole("article")[0]).toHaveAccessibleName("Noise · 485 Segar Road");
  expect(document.querySelector("article time")).toHaveAttribute("datetime", "2026-11-09T15:40:00.000Z");
});
