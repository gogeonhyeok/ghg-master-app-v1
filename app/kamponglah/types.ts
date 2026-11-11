import type { Complaint, Topic } from "./data";
import type { ComplaintComment } from "./comments";
import type { Votes, VoteTotals } from "./votes";

export type Theme = "light" | "dark";
export type FeedView = { query?: string; filter?: Topic | "All"; area?: string | null };
export type Snapshot = { posts: Complaint[]; comments: ComplaintComment[]; votes: Votes; totals: VoteTotals; theme: Theme };
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };
export type EntryInput = { text: string; area?: string | null; anonymous?: boolean };
