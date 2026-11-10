import { type RankedComplaint, type Topic, topics } from "./data";
import ComplaintList from "./ComplaintList";
import type { CommentThreads } from "./comments";
import styles from "./kamponglah.module.css";

export default function ComplaintFeed({ posts, filter, onFilter, heading, searching, onEdit, onDelete, commentThreads }: {
  posts: RankedComplaint[];
  filter: Topic | "All";
  onFilter: (topic: Topic | "All") => void;
  heading: string;
  searching: boolean;
  onEdit: () => void;
  onDelete: (id: string) => void;
  commentThreads: CommentThreads;
}) {
  return (
    <section className={styles.feed} aria-labelledby="feed-heading">
      <header className={styles.feedHeading}><h2 id="feed-heading">{heading}</h2></header>
      <div className={styles.filters} role="group" aria-label="Filter complaints">
        {(["All", ...topics] as const).map((topic) => <button key={topic} type="button" aria-pressed={filter === topic} onClick={() => onFilter(topic)}>{topic === "All" ? "For you" : topic}</button>)}
        <span aria-live="polite">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
      </div>
      <ComplaintList posts={posts} label="Complaints" onDelete={onDelete} commentThreads={commentThreads} />
      {!posts.length && <div className={styles.empty}><p role="status">{searching ? "No complaints found." : "Wah, so peaceful."}</p>{!searching && <button type="button" onClick={onEdit}>Write a post</button>}</div>}
    </section>
  );
}
