/** @jest-environment node */
jest.mock("server-only", () => ({}));
import { createHmac } from "node:crypto";
import { createPost, createComment, readSnapshot, removePost, removeComment, setVote, saveTheme } from "./api";

const secret = "kamponglah-tests-only-signing-secret-0123456789";
const resident = { ownerId: "a".repeat(64), name: "Alex Tan" };
const postId = "89a353e9-e9c5-4148-9086-e7184ccdfd86";
const commentId = "1aa353e9-e9c5-4148-9086-e7184ccdfd86";
const base = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/kamponglah";
const empty = { posts: [], comments: [], votes: {}, totals: {}, theme: "light" };
const post = { id: postId, text: "Noisy lift #Tampines", area: "Tampines", place: "Tampines", topic: "Noise", createdAt: 1794400000000, author: "Alex Tan", canDelete: true };
const originalFetch = global.fetch;
const fetchMock = jest.fn();
let originalSecret: string | undefined;
let originalBase: string | undefined;

function reply(body: unknown, status = 200, type = "application/json") {
  return { ok: status >= 200 && status < 300, status, headers: new Headers({ "Content-Type": type }), json: async () => body };
}
beforeEach(() => {
  originalSecret = process.env.KAMPONGLAH_IDENTITY_SECRET;
  originalBase = process.env.KAMPONGLAH_API_BASE_URL;
  process.env.KAMPONGLAH_IDENTITY_SECRET = secret;
  delete process.env.KAMPONGLAH_API_BASE_URL;
  global.fetch = fetchMock;
  fetchMock.mockReset().mockResolvedValue(reply({ ok: true }));
});
afterEach(() => {
  global.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.KAMPONGLAH_IDENTITY_SECRET; else process.env.KAMPONGLAH_IDENTITY_SECRET = originalSecret;
  if (originalBase === undefined) delete process.env.KAMPONGLAH_API_BASE_URL; else process.env.KAMPONGLAH_API_BASE_URL = originalBase;
});

test("uses the deployed feed with encoded search, topic and area and an API-compatible server assertion", async () => {
  fetchMock.mockResolvedValue(reply({ ok: true, data: empty }));
  expect(await readSnapshot(resident, { query: "lift #SegarRoad & smells", filter: "Noise", area: "Bukit Panjang" })).toEqual(empty);
  const [url, options] = fetchMock.mock.calls[0];
  const target = new URL(url);
  expect(target.origin + target.pathname).toBe(`${base}/feed`);
  expect([...target.searchParams.entries()]).toEqual([["query", "lift #SegarRoad & smells"], ["filter", "Noise"], ["area", "Bukit Panjang"]]);
  expect(options).toMatchObject({ method: "GET", cache: "no-store", redirect: "error", signal: expect.any(AbortSignal), headers: { Accept: "application/json" } });
  expect(options).not.toHaveProperty("body");
  const [payload, signature] = options.headers.Authorization.replace("Bearer ", "").split(".");
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  expect(claims).toEqual({ ownerId: resident.ownerId, name: "Alex Tan", aud: "kamponglah", iat: expect.any(Number), exp: expect.any(Number) });
  expect(claims.exp - claims.iat).toBe(60);
  expect(Math.abs(claims.iat - Math.floor(Date.now() / 1000))).toBeLessThanOrEqual(1);
  expect(signature).toBe(createHmac("sha256", secret).update(`kamponglah.v1.${payload}`).digest("base64url"));
  expect(JSON.stringify(options)).not.toContain(secret);
});

test("sends every write to its Camel endpoint, preserves anonymity and removes submitted identity fields", async () => {
  fetchMock.mockResolvedValue(reply({ ok: true, id: postId }, 201));
  await createPost(resident, { text: "Noisy lift", anonymous: true, area: "Bedok", author: "Forged", ownerId: "other", createdAt: 1 } as never);
  expect(fetchMock).toHaveBeenLastCalledWith(`${base}/complaints`, expect.objectContaining({ method: "POST", body: JSON.stringify({ text: "Noisy lift", area: "Bedok", anonymous: true }), headers: expect.objectContaining({ "Content-Type": "application/json" }) }));
  fetchMock.mockResolvedValue(reply({ ok: true, id: commentId }, 201));
  await createComment(resident, postId, { text: "Same here", anonymous: false });
  expect(fetchMock).toHaveBeenLastCalledWith(`${base}/complaints/${postId}/comments`, expect.objectContaining({ method: "POST", body: JSON.stringify({ text: "Same here", anonymous: false }) }));
  fetchMock.mockResolvedValue(reply({ ok: true }));
  await removePost(resident, postId);
  expect(fetchMock).toHaveBeenLastCalledWith(`${base}/complaints/${postId}`, expect.objectContaining({ method: "DELETE" }));
  expect(fetchMock.mock.calls.at(-1)[1]).not.toHaveProperty("body");
  await removeComment(resident, commentId);
  expect(fetchMock).toHaveBeenLastCalledWith(`${base}/comments/${commentId}`, expect.objectContaining({ method: "DELETE" }));
  for (const choice of ["like", "dislike", null] as const) {
    await setVote(resident, postId, choice);
    expect(fetchMock).toHaveBeenLastCalledWith(`${base}/complaints/${postId}/vote`, expect.objectContaining({ method: "PUT", body: JSON.stringify({ choice }) }));
  }
  await saveTheme(resident, "dark");
  expect(fetchMock).toHaveBeenLastCalledWith(`${base}/preferences`, expect.objectContaining({ method: "PUT", body: '{"theme":"dark"}' }));
  expect(fetchMock).toHaveBeenCalledTimes(8);
});

test("returns allowlisted public fields, server counts, ownership flags and preferences", async () => {
  const comment = { id: commentId, postId, text: "Same here", createdAt: post.createdAt, author: "Wanderer", canDelete: false };
  const data = { posts: [{ ...post, ownerId: "private", searchText: "private" }], comments: [{ ...comment, ownerId: "private" }],
    votes: { [postId]: "like" }, totals: { [postId]: { like: 2, dislike: 1, private: true } }, theme: "dark", ownerId: "private" };
  fetchMock.mockResolvedValue(reply({ ok: true, data }));
  expect(await readSnapshot(resident)).toEqual({ posts: [post], comments: [comment], votes: { [postId]: "like" }, totals: { [postId]: { like: 2, dislike: 1 } }, theme: "dark" });
});

test("signs guest identities and bounds verified names without sharing email or guest cookies", async () => {
  fetchMock.mockResolvedValue(reply({ ok: true, data: empty }));
  for (const name of [null, "x".repeat(120)]) {
    await readSnapshot({ ...resident, name });
    const payload = fetchMock.mock.calls.at(-1)[1].headers.Authorization.split(" ")[1].split(".")[0];
    expect(JSON.parse(Buffer.from(payload, "base64url").toString()).name).toBe(name === null ? null : "x".repeat(100));
  }
});

test("supports a server-configured API stage and local fixtures but rejects credential-bearing or insecure remote URLs", async () => {
  fetchMock.mockResolvedValue(reply({ ok: true, data: empty }));
  process.env.KAMPONGLAH_API_BASE_URL = "https://example.test/stage/";
  await readSnapshot(resident);
  expect(fetchMock.mock.calls.at(-1)[0]).toBe("https://example.test/stage/kamponglah/feed");
  process.env.KAMPONGLAH_API_BASE_URL = "http://127.0.0.1:8080";
  await readSnapshot(resident);
  expect(fetchMock.mock.calls.at(-1)[0]).toBe("http://127.0.0.1:8080/kamponglah/feed");
  fetchMock.mockClear();
  for (const base of ["http://example.test", "https://user:secret@example.test", "https://example.test/?key=secret", "https://example.test/#fragment"]) {
    process.env.KAMPONGLAH_API_BASE_URL = base;
    await expect(readSnapshot(resident)).rejects.toThrow();
  }
  expect(fetchMock).not.toHaveBeenCalled();
});

test("rejects invalid input and path injection before making HTTP requests", async () => {
  for (const text of ["", "   ", "a".repeat(601)]) await expect(createPost(resident, { text })).rejects.toThrow("characters");
  await expect(createPost(resident, { text: "Hello", area: "Unknown" })).rejects.toThrow("known area");
  await expect(createPost(resident, { text: "Hello", anonymous: "yes" as never })).rejects.toThrow("anonymous");
  await expect(createComment(resident, postId, { text: "a".repeat(401) })).rejects.toThrow("characters");
  await expect(removePost(resident, "../preferences")).rejects.toThrow("unavailable");
  await expect(removeComment(resident, "bad-id")).rejects.toThrow("unavailable");
  await expect(setVote(resident, postId, "other" as never)).rejects.toThrow("Like or Dislike");
  await expect(saveTheme(resident, "other" as never)).rejects.toThrow("known theme");
  await expect(readSnapshot(resident, { query: "a".repeat(201) })).rejects.toThrow("200");
  await expect(readSnapshot(resident, { filter: "Other" as never })).rejects.toThrow("known topic");
  await expect(readSnapshot(resident, { area: "Unknown" })).rejects.toThrow("known area");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("fails closed when signing configuration or resident identity is invalid", async () => {
  for (const secret of [undefined, "", "short"]) {
    if (secret === undefined) delete process.env.KAMPONGLAH_IDENTITY_SECRET; else process.env.KAMPONGLAH_IDENTITY_SECRET = secret;
    await expect(readSnapshot(resident)).rejects.toThrow("not configured");
  }
  process.env.KAMPONGLAH_IDENTITY_SECRET = "x".repeat(32);
  await expect(readSnapshot({ ...resident, ownerId: "browser-selected" })).rejects.toThrow("Invalid resident");
  expect(fetchMock).not.toHaveBeenCalled();
});

test.each([
  [400, "Please check"], [401, "session expired"], [403, "own entry"], [404, "no longer available"], [503, "not configured"], [502, "Couldn’t reach"], [500, "Couldn’t reach"],
])("maps HTTP %s safely without exposing upstream details or retrying writes", async (status, message) => {
  fetchMock.mockResolvedValue(reply({ ok: false, error: "private connection credentials" }, status));
  await expect(createPost(resident, { text: "Noise" })).rejects.toThrow(message);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("rejects malformed success responses, mismatched snapshots and missing creation IDs", async () => {
  const invalid = [undefined, { ok: false }, { ok: true, data: {} }, { ok: true, data: { ...empty, theme: "other" } },
    { ok: true, data: { ...empty, posts: [{ ...post, createdAt: "yesterday" }] } },
    { ok: true, data: { ...empty, votes: { [postId]: "like" } } },
    { ok: true, data: { ...empty, posts: [post], totals: { [postId]: { like: -1, dislike: 0 } } } },
    { ok: true, data: { ...empty, posts: [post], totals: {} } }];
  for (const body of invalid) {
    fetchMock.mockResolvedValue(reply(body));
    await expect(readSnapshot(resident)).rejects.toThrow();
  }
  fetchMock.mockResolvedValue(reply({ ok: true, data: empty }, 200, "text/html"));
  await expect(readSnapshot(resident)).rejects.toThrow();
  fetchMock.mockResolvedValue(reply({ ok: true }));
  await expect(createPost(resident, { text: "Noise" })).rejects.toThrow("ID");
  await expect(createComment(resident, postId, { text: "Same here" })).rejects.toThrow("ID");
});

test("network and timeout failures do not fall back to another store or retry a write", async () => {
  fetchMock.mockRejectedValue(new Error("private proxy credentials"));
  await expect(createPost(resident, { text: "Noise" })).rejects.toThrow();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
