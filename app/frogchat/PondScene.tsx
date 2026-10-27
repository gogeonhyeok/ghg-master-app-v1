import { BUBBLE_MS, type PondSnapshot } from "../../lib/frogchat/types";
import { memo } from "react";
import Frog from "./Frog";
import styles from "./frogchat.module.css";

function PondScene({ snapshot, selfId, now }: { snapshot: PondSnapshot; selfId: string | null; now: number }) {
  return (
    <section className={styles.scene} tabIndex={0} aria-label="Shared frog room" aria-describedby="movement-help">
      <div className={styles.sceneNote}><span className={styles.smallDot} />A little space to just be.</div>
      <div className={styles.ground} />
      <div className={styles.field}>
        {snapshot.frogs.map((frog, index) => {
          const message = snapshot.messages.findLast(item => item.frogId === frog.id);
          const age = message ? now - message.sentAt : Infinity;
          return <Frog key={frog.id} frog={frog} self={frog.id === selfId} now={now} message={age >= 0 && age < BUBBLE_MS ? message : undefined} fallbackX={50 + (index - (snapshot.frogs.length - 1) / 2) * 12} />;
        })}
      </div>
      {!snapshot.frogs.length && <p className={styles.arriving}>Your frog is on its way.</p>}
    </section>
  );
}

export default memo(PondScene);
