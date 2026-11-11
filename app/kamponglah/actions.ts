"use server";

import { getResident } from "./identity";
import { ComplaintError, createPost, createComment, readSnapshot, removePost, removeComment, setVote, saveTheme } from "./api";
import type { ActionResult, EntryInput, FeedView, Theme } from "./types";
import type { Vote } from "./votes";

async function handle<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try { return { ok: true, data: await work() }; }
  catch (error) { return { ok: false, error: error instanceof ComplaintError ? error.message : "Couldn’t reach Kamponglah. Please try again." }; }
}
export async function loadComplaints(view: FeedView = {}) { return handle(async () => readSnapshot(await getResident(), view)); }
export async function postComplaint(input: EntryInput) { return handle(async () => createPost(await getResident(), input)); }
export async function deleteComplaint(id: string) { return handle(async () => removePost(await getResident(), id)); }
export async function postComment(postId: string, input: EntryInput) { return handle(async () => createComment(await getResident(), postId, input)); }
export async function deleteComment(id: string) { return handle(async () => removeComment(await getResident(), id)); }
export async function voteComplaint(postId: string, choice: Vote | null) { return handle(async () => setVote(await getResident(), postId, choice)); }
export async function updateTheme(theme: Theme) { return handle(async () => saveTheme(await getResident(), theme)); }
