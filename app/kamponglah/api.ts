import "server-only";
import { createHmac } from "node:crypto";
import { places, topics } from "./data";
import { COMMENT_MAX_LENGTH } from "./comments";
import type { Resident } from "./identity";
import type { EntryInput, FeedView, Snapshot, Theme } from "./types";
import type { Vote } from "./votes";

const defaultBaseUrl = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com";
const unavailable = "Couldn’t reach Kamponglah. Please try again.";
const unconfigured = "Kamponglah is not configured yet.";
const isId = (value: unknown): value is string => typeof value === "string" && /^[a-f\d-]{36}$/.test(value);
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isVote = (value: unknown): value is Vote => value === "like" || value === "dislike";

export class ComplaintError extends Error {}

function endpoint(path: string): string {
  const base = new URL(process.env.KAMPONGLAH_API_BASE_URL || defaultBaseUrl);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if ((base.protocol !== "https:" && !(local && base.protocol === "http:")) || base.username || base.password || base.search || base.hash) {
    throw new Error("Invalid Kamponglah API base URL");
  }
  return `${base.href.replace(/\/$/, "")}/kamponglah${path}`;
}

function authorization(resident: Resident): string {
  const secret = process.env.KAMPONGLAH_IDENTITY_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) throw new ComplaintError(unconfigured);
  if (!/^[a-f\d]{64}$/.test(resident.ownerId) || (resident.name !== null && typeof resident.name !== "string")) throw new Error("Invalid resident");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    ownerId: resident.ownerId, name: resident.name?.trim().slice(0, 100) ?? null,
    aud: "kamponglah", iat: now, exp: now + 60,
  }), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(`kamponglah.v1.${payload}`, "utf8").digest("base64url");
  return `Bearer ${payload}.${signature}`;
}

async function request(resident: Resident, method: string, path: string, body?: unknown): Promise<Record<string, unknown>> {
  const credential = authorization(resident);
  const response = await fetch(endpoint(path), {
    method,
    headers: { Accept: "application/json", Authorization: credential, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    // Show only known messages, never arbitrary upstream error or proxy details.
    const messages: Record<number, string> = {
      400: "Please check your complaint or selection.",
      401: "Your Kamponglah session expired. Please try again.",
      403: "Only your own entry can be deleted.",
      404: "This complaint is no longer available.",
      503: unconfigured,
    };
    throw new ComplaintError(messages[response.status] ?? unavailable);
  }
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error("Invalid Kamponglah content type");
  const result: unknown = await response.json();
  if (!isRecord(result) || result.ok !== true) throw new Error("Invalid Kamponglah response");
  return result;
}

function requireId(value: unknown): asserts value is string {
  if (!isId(value)) throw new ComplaintError("This entry is unavailable.");
}
function areaHint(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string" || !places.some((place) => place.area === value)) throw new ComplaintError("Choose a known area or leave it blank.");
  return value;
}
function entry(input: EntryInput, maximum: number): EntryInput {
  if (!input || typeof input.text !== "string" || !input.text.trim() || input.text.length > maximum) throw new ComplaintError(`Enter between 1 and ${maximum} characters.`);
  if (input.anonymous !== undefined && typeof input.anonymous !== "boolean") throw new ComplaintError("Invalid anonymous choice.");
  return { text: input.text, area: areaHint(input.area), anonymous: input.anonymous };
}

function snapshot(value: unknown): Snapshot {
  if (!isRecord(value) || !Array.isArray(value.posts) || value.posts.length > 200 || !Array.isArray(value.comments) ||
    !isRecord(value.votes) || !isRecord(value.totals) || (value.theme !== "light" && value.theme !== "dark")) throw new Error("Invalid Kamponglah snapshot");
  const posts = value.posts.map((post: unknown) => {
    if (!isRecord(post) || !isId(post.id) || typeof post.text !== "string" || typeof post.author !== "string" || typeof post.canDelete !== "boolean" ||
      !isCount(post.createdAt) || (post.area !== null && typeof post.area !== "string") || (post.place !== null && typeof post.place !== "string") ||
      !topics.includes(post.topic as typeof topics[number])) throw new Error("Invalid Kamponglah complaint");
    return { id: post.id, text: post.text, author: post.author, canDelete: post.canDelete, createdAt: post.createdAt,
      area: post.area as string | null, place: post.place as string | null, topic: post.topic as typeof topics[number] };
  });
  const ids = new Set(posts.map((post) => post.id));
  const comments = value.comments.map((comment: unknown) => {
    if (!isRecord(comment) || !isId(comment.id) || typeof comment.postId !== "string" || !ids.has(comment.postId) || typeof comment.text !== "string" ||
      typeof comment.author !== "string" || typeof comment.canDelete !== "boolean" || !isCount(comment.createdAt)) throw new Error("Invalid Kamponglah comment");
    return { id: comment.id, postId: comment.postId, text: comment.text, author: comment.author, canDelete: comment.canDelete, createdAt: comment.createdAt };
  });
  const votes = Object.fromEntries(Object.entries(value.votes).map(([id, choice]) => {
    if (!ids.has(id) || !isVote(choice)) throw new Error("Invalid Kamponglah vote");
    return [id, choice];
  }));
  const totals = Object.fromEntries(Object.entries(value.totals).map(([id, counts]) => {
    if (!ids.has(id) || !isRecord(counts) || !isCount(counts.like) || !isCount(counts.dislike)) throw new Error("Invalid Kamponglah counts");
    return [id, { like: counts.like, dislike: counts.dislike }];
  }));
  if (posts.some((post) => !Object.hasOwn(totals, post.id))) throw new Error("Missing Kamponglah counts");
  // Keep private and unexpected response fields out of the browser's action result.
  return { posts, comments, votes, totals, theme: value.theme };
}

export async function readSnapshot(resident: Resident, view: FeedView = {}): Promise<Snapshot> {
  if (!view || typeof view !== "object" || (view.query !== undefined && (typeof view.query !== "string" || view.query.length > 200))) throw new ComplaintError("Search is limited to 200 characters.");
  if (view.filter !== undefined && view.filter !== "All" && !topics.includes(view.filter)) throw new ComplaintError("Choose a known topic.");
  const area = areaHint(view.area);
  const params = new URLSearchParams();
  if (view.query) params.set("query", view.query);
  if (view.filter) params.set("filter", view.filter);
  if (area) params.set("area", area);
  const query = params.toString();
  return snapshot((await request(resident, "GET", `/feed${query ? `?${query}` : ""}`)).data);
}
export async function createPost(resident: Resident, input: EntryInput): Promise<void> {
  const result = await request(resident, "POST", "/complaints", entry(input, 600));
  if (!isId(result.id)) throw new Error("Missing Kamponglah complaint ID");
}
export async function removePost(resident: Resident, id: string): Promise<void> {
  requireId(id);
  await request(resident, "DELETE", `/complaints/${id}`);
}
export async function createComment(resident: Resident, postId: string, input: EntryInput): Promise<void> {
  requireId(postId);
  const result = await request(resident, "POST", `/complaints/${postId}/comments`, entry(input, COMMENT_MAX_LENGTH));
  if (!isId(result.id)) throw new Error("Missing Kamponglah comment ID");
}
export async function removeComment(resident: Resident, id: string): Promise<void> {
  requireId(id);
  await request(resident, "DELETE", `/comments/${id}`);
}
export async function setVote(resident: Resident, postId: string, choice: Vote | null): Promise<void> {
  requireId(postId);
  if (choice !== null && !isVote(choice)) throw new ComplaintError("Choose Like or Dislike.");
  await request(resident, "PUT", `/complaints/${postId}/vote`, { choice });
}
export async function saveTheme(resident: Resident, theme: Theme): Promise<void> {
  if (theme !== "light" && theme !== "dark") throw new ComplaintError("Choose a known theme.");
  await request(resident, "PUT", "/preferences", { theme });
}
