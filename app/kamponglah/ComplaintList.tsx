import { type Complaint, hashtags } from "./data";
import ComplaintComments from "./ComplaintComments";
import type { CommentThreads } from "./comments";
import { resolveAuthor } from "./authors";
import ComplaintVotes from "./ComplaintVotes";
import type { ComplaintVoting } from "./votes";
import styles from "./kamponglah.module.css";

const timestampFormat = new Intl.DateTimeFormat("en-SG", {
  day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  hour12: true, timeZone: "Asia/Singapore",
});

function ComplaintContent({ text }: { text: string }) {
  const tags = Array.from(new Map(hashtags(text).map((tag) => [tag.toLowerCase(), tag])).values());
  const body = text.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/[ \t]{2,}/g, " ").trim();

  return <>
    {body && <p className={styles.postText}>{body}</p>}
    {tags.length > 0 && <ul className={styles.hashtags} aria-label="Hashtags">
      {tags.map((tag) => <li className={styles.hashtag} key={tag.toLowerCase()}>#{tag}</li>)}
    </ul>}
  </>;
}

export default function ComplaintList({ posts, label, onDelete, commentThreads, voting, disabled }: {
  posts: Complaint[];
  label: string;
  onDelete: (id: string) => void;
  commentThreads: CommentThreads;
  voting: ComplaintVoting;
  disabled: boolean;
}) {
  return (
    <ul className={styles.posts} aria-label={label}>
      {posts.map((post) => (
        <li key={post.id}>
          <article className={styles.post} aria-label={`${post.topic} · ${post.place ?? "Singapore"}`}>
            <ComplaintContent text={post.text} />
            <footer>
              <div>
                <span className={styles.author}>{post.author ?? resolveAuthor(null, post.area)}</span><span aria-hidden="true">·</span>
                <span>{post.place ?? "Area not tagged"}</span><span aria-hidden="true">·</span>
                <span>{post.topic}</span><span aria-hidden="true">·</span>
                {post.canDelete && <><span>Your post</span><span aria-hidden="true">·</span></>}
                <time dateTime={new Date(post.createdAt).toISOString()} title={`${timestampFormat.format(post.createdAt)} SGT`}>{timestampFormat.format(post.createdAt)}</time>
              </div>
              {post.canDelete && <button type="button" disabled={disabled} onClick={() => onDelete(post.id)} aria-label={`Delete your post: ${post.text.slice(0, 40)}`}>Delete</button>}
            </footer>
            <ComplaintComments postId={post.id} threads={commentThreads} reactions={<ComplaintVotes postId={post.id} voting={voting} />} />
          </article>
        </li>
      ))}
    </ul>
  );
}
