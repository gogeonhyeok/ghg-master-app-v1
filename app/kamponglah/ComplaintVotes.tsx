import type { ComplaintVoting } from "./votes";
import styles from "./kamponglah.module.css";

export default function ComplaintVotes({ postId, voting }: { postId: string; voting: ComplaintVoting }) {
  const selected = voting.votes[postId];
  const totals = voting.totals[postId] ?? { like: 0, dislike: 0 };
  return <div className={styles.votes} role="group" aria-label="Vote on this complaint">
    {(["like", "dislike"] as const).map((vote) => <button key={vote} type="button" aria-label={`${vote === "like" ? "Like" : "Dislike"} ${totals[vote]}`} title={vote === "like" ? "Like" : "Dislike"} aria-pressed={selected === vote} disabled={!voting.ready} onClick={() => voting.onVote(postId, vote)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <g transform={vote === "dislike" ? "rotate(180 12 12)" : undefined}>
          <rect x="2" y="10" width="5" height="12" rx="1" />
          <path d="m7 10 4-7h1a3 3 0 0 1 3 3l-1 4h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7" />
        </g>
      </svg>
      <span>{totals[vote]}</span>
    </button>)}
  </div>;
}
