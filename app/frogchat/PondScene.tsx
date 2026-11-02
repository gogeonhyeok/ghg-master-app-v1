import { BUBBLE_MS, type PondSnapshot } from "../../lib/frogchat/types";
import { memo, useMemo } from "react";
import Frog from "./Frog";
import type { TimedFrog } from "../../lib/frogchat/interpolation";
import styles from "./frogchat.module.css";

function PondScene({ snapshot, selfId, now }: { snapshot: Omit<PondSnapshot, "frogs"> & { frogs: TimedFrog[] }; selfId: string | null; now: number }) {
  const latestMessages = useMemo(() => new Map(snapshot.messages.map(message => [message.frogId, message])), [snapshot.messages]);
  return (
    <section className={styles.scene} tabIndex={0} aria-label="Shared frog room" aria-describedby="movement-help">
      <div className={styles.sceneNote}><span className={styles.smallDot} />A little space to just be.</div>
      <div className={styles.field}>
        <div className={styles.baseline}>
          <div className={styles.ground} aria-hidden="true" />
          {snapshot.frogs.map((frog, index) => {
            const message = latestMessages.get(frog.id);
            const age = message ? now - message.sentAt : Infinity;
            return <Frog key={frog.id} frog={frog} self={frog.id === selfId} now={now} message={age >= 0 && age < BUBBLE_MS ? message : undefined} fallbackX={50 + (index - (snapshot.frogs.length - 1) / 2) * 12} />;
          })}
        </div>
      </div>
      {!snapshot.frogs.length && <p className={styles.arriving}>Your frog is on its way.</p>}
    </section>
  );
}

export default memo(PondScene);
