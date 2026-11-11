/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("./identity", () => ({ getResident: jest.fn() }));
jest.mock("./api", () => ({ ...jest.requireActual("./api"), createPost: jest.fn(), createComment: jest.fn(), readSnapshot: jest.fn(), removePost: jest.fn(), removeComment: jest.fn(), setVote: jest.fn(), saveTheme: jest.fn() }));
import * as actions from "./actions";
import * as api from "./api";
import { getResident } from "./identity";

const resident = { ownerId: "server-owned-id", name: "Alex Tan" };
beforeEach(() => { jest.clearAllMocks(); jest.mocked(getResident).mockResolvedValue(resident); });

test("resolves the server resident on every operation instead of trusting a submitted author", async () => {
  const input = { text: "Noisy lift", author: "Forged", ownerId: "other", anonymous: true };
  await actions.postComplaint(input);
  expect(api.createPost).toHaveBeenCalledWith(resident, input);
  await actions.loadComplaints({ query: "#Tampines" });
  await actions.postComment("post", input);
  await actions.deleteComplaint("post");
  await actions.deleteComment("comment");
  await actions.voteComplaint("post", "like");
  await actions.updateTheme("dark");
  expect(getResident).toHaveBeenCalledTimes(7);
  expect(api.readSnapshot).toHaveBeenCalledWith(resident, { query: "#Tampines" });
  expect(api.removePost).toHaveBeenCalledWith(resident, "post");
  expect(api.removeComment).toHaveBeenCalledWith(resident, "comment");
  expect(api.setVote).toHaveBeenCalledWith(resident, "post", "like");
  expect(api.saveTheme).toHaveBeenCalledWith(resident, "dark");
});

test("returns validation errors but keeps upstream and credential errors private", async () => {
  jest.mocked(api.createPost).mockRejectedValueOnce(new api.ComplaintError("Enter a complaint."));
  expect(await actions.postComplaint({ text: "" })).toEqual({ ok: false, error: "Enter a complaint." });
  jest.mocked(api.readSnapshot).mockRejectedValueOnce(new Error("private database address"));
  const result = await actions.loadComplaints();
  expect(result).toEqual({ ok: false, error: "Couldn’t reach Kamponglah. Please try again." });
  expect(JSON.stringify(result)).not.toContain("private database address");
});
