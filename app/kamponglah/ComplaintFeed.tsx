import { type RankedComplaint, type Topic, topics } from "./data";
import ComplaintList from "./ComplaintList";
import type { CommentThreads } from "./comments";
import type { ComplaintVoting } from "./votes";
import styles from "./kamponglah.module.css";

export default function ComplaintFeed({ posts, filter, onFilter, searching, onEdit, onDelete, commentThreads, voting, loading, disabled, ready }: {
  posts: RankedComplaint[];
  filter: Topic | "All";
  onFilter: (topic: Topic | "All") => void;
  searching: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
  commentThreads: CommentThreads;
  voting: ComplaintVoting;
  loading: boolean;
  disabled: boolean;
  ready: boolean;
}) {
  return (
    <section className={styles.feed} aria-label="Complaints">
      <div className={styles.filters} role="group" aria-label="Filter complaints">
        {(["All", ...topics] as const).map((topic) => <button key={topic} type="button" aria-pressed={filter === topic} onClick={() => onFilter(topic)}>{topic === "All" ? "For you" : topic}</button>)}
        <span aria-live="polite">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
      </div>
      {loading && <p role="status">Loading…</p>}
      <ComplaintList posts={posts} label="Complaints" onDelete={onDelete} disabled={disabled} commentThreads={commentThreads} voting={voting} />
      {ready && !loading && !posts.length && <div className={styles.empty}><p role="status">{searching ? "No complaints found." : "Wah, so peaceful."}</p>{!searching && <button type="button" onClick={onEdit}>Write a post</button>}</div>}
    </section>
  );
}
