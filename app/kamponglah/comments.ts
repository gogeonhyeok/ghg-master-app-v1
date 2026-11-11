export const COMMENT_MAX_LENGTH = 400;
export type ComplaintComment = { id: string; postId: string; text: string; createdAt: number; author?: string; canDelete?: boolean };
export type CommentThreads = {
  comments: ComplaintComment[];
  onAdd: (postId: string, text: string, anonymous?: boolean) => Promise<boolean>;
  onDelete: (id: string) => void;
  canPostAnonymously?: boolean;
  ready: boolean;
};
