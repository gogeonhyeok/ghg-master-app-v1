import { type ReactNode, useId, useState } from "react";
import { COMMENT_MAX_LENGTH, type CommentThreads } from "./comments";
import { resolveAuthor } from "./authors";
import styles from "./kamponglah.module.css";

export default function ComplaintComments({ postId, threads, reactions }: { postId: string; threads: CommentThreads; reactions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const id = useId();
  const comments = threads.comments.filter((comment) => comment.postId === postId);

  return <div className={styles.comments}>
    <div className={styles.postActions}>
      {reactions}
      <button className={styles.commentToggle} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {comments.length ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}` : "Comment"}
      </button>
    </div>
    {open && <section id={id} className={styles.commentThread} aria-label="Comments">
      {comments.length > 0 && <ul className={styles.commentList}>
        {comments.map((comment) => <li key={comment.id}>
          <div className={styles.commentMeta}><span>{comment.author ?? resolveAuthor(null, null)}</span>{comment.canDelete && <button type="button" disabled={!threads.ready} onClick={() => threads.onDelete(comment.id)} aria-label={`Delete your comment: ${comment.text.slice(0, 40)}`}>Delete</button>}</div>
          <p>{comment.text}</p>
        </li>)}
      </ul>}
      <form className={styles.commentForm} onSubmit={async (event) => {
        event.preventDefault();
        const submitted = text;
        if (await threads.onAdd(postId, submitted, anonymous)) setText((current) => current === submitted ? "" : current);
      }}>
        <label className={styles.srOnly} htmlFor={`${id}-input`}>Your comment</label>
        <textarea id={`${id}-input`} value={text} onChange={(event) => setText(event.target.value)} placeholder="Say something lah…" maxLength={COMMENT_MAX_LENGTH} rows={2} />
        <div>
          {threads.canPostAnonymously && <label className={styles.anonymousOption}><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />Anonymous</label>}
          <span className={styles.counter}>{text.length}/{COMMENT_MAX_LENGTH}</span><button className={styles.submit} type="submit" disabled={!threads.ready || !text.trim() || text.length > COMMENT_MAX_LENGTH}>Reply</button>
        </div>
      </form>
    </section>}
  </div>;
}
