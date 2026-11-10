import { isValidSavedAuthor } from "./authors";

export const COMMENTS_STORAGE_KEY = "kamponglah-comments-v1";
export const COMMENT_MAX_LENGTH = 400;

export type ComplaintComment = { id: string; postId: string; text: string; createdAt: number; author?: string };
export type CommentThreads = {
  comments: ComplaintComment[];
  onAdd: (postId: string, text: string, anonymous?: boolean) => boolean;
  onDelete: (id: string) => void;
  canPostAnonymously?: boolean;
};

export function readSavedComments(raw: string | null, postIds: Set<string>): ComplaintComment[] {
  try {
    const values: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(values)) return [];
    const ids = new Set<string>();
    return values.filter((value): value is ComplaintComment => {
      if (!value || typeof value !== "object") return false;
      const comment = value as Partial<ComplaintComment>;
      if (typeof comment.id !== "string" || !comment.id || ids.has(comment.id)
        || typeof comment.postId !== "string" || !postIds.has(comment.postId)
        || typeof comment.text !== "string" || !comment.text.trim() || comment.text.length > COMMENT_MAX_LENGTH
        || typeof comment.createdAt !== "number" || !Number.isFinite(comment.createdAt)
        || !isValidSavedAuthor(comment.author)) return false;
      ids.add(comment.id);
      return true;
    }).slice(-500);
  } catch { return []; }
}
