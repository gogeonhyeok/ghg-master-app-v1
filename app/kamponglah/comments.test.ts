import { readSavedComments } from "./comments";

test("ignores corrupt, duplicate and orphaned saved comments", () => {
  const valid = { id: "comment-1", postId: "sample-1", text: "Same here", createdAt: 10 };
  const posts = new Set(["sample-1"]);
  expect(readSavedComments("broken json", posts)).toEqual([]);
  expect(readSavedComments("{}", posts)).toEqual([]);
  expect(readSavedComments(JSON.stringify([null, valid, valid, { ...valid, id: "empty", text: " " }, { ...valid, id: "long", text: "a".repeat(401) }, { ...valid, id: "orphan", postId: "gone" }, { ...valid, id: "bad-date", createdAt: "yesterday" }]), posts)).toEqual([valid]);
});
