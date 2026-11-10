import ComplaintList from "./ComplaintList";
import type { Complaint } from "./data";
import type { CommentThreads } from "./comments";
import styles from "./kamponglah.module.css";

export default function NearbyHighlights({ posts, area, onDelete, commentThreads }: {
  posts: Complaint[];
  area: string | null;
  onDelete: (id: string) => void;
  commentThreads: CommentThreads;
}) {
  return (
    <section className={styles.highlights} aria-labelledby="highlights-heading">
      <header className={styles.highlightsHeading}>
        <h2 id="highlights-heading">Highlights around you</h2>
        {area && <span>{area}</span>}
      </header>
      {posts.length > 0
        ? <ComplaintList posts={posts} label="Nearby complaints" onDelete={onDelete} commentThreads={commentThreads} />
        : <p className={styles.highlightsEmpty}>{area ? "No nearby posts in this topic yet." : "Use your location or add an area hashtag."}</p>}
    </section>
  );
}
