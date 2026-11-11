export type Vote = "like" | "dislike";
export type Votes = Record<string, Vote>;
export type VoteTotals = Record<string, { like: number; dislike: number }>;
export type ComplaintVoting = { votes: Votes; totals: VoteTotals; onVote: (postId: string, vote: Vote) => void; ready: boolean };
