/** @jest-environment node */
jest.mock("server-only", () => ({}));
import { randomBytes } from "node:crypto";
import { readSnapshot } from "./api";

// Read-only: requires the same signing key as the deployed API; never creates test posts.
const integration = process.env.KAMPONGLAH_API_TEST === "1" ? test : test.skip;
integration("reads the deployed feed with a signed resident assertion", async () => {
  const snapshot = await readSnapshot({ ownerId: randomBytes(32).toString("hex"), name: null });
  expect(snapshot.posts.length).toBeLessThanOrEqual(200);
  expect(["light", "dark"]).toContain(snapshot.theme);
  expect(JSON.stringify(snapshot)).not.toMatch(/"ownerId"|"searchText"/);
}, 20000);
