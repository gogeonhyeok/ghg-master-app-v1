import { memo, useState, type CSSProperties } from "react";
import { JUMP_MS, type PondMessage } from "../../lib/frogchat/types";
import type { TimedFrog as Resident } from "../../lib/frogchat/interpolation";
import { useFrogAnimation } from "./useFrogAnimation";
import { useFrogJump } from "./useFrogJump";
import { useMessageBounce } from "./useMessageBounce";
import styles from "./frogchat.module.css";

export function FrogPortrait() {
  return <svg viewBox="0 0 51 51" aria-hidden="true" className={styles.frogImage}><image href="/frogchat/frog.svg" width="51" height="51" /></svg>;
}
function Sprite({ frog, message, now, self }: { frog: Resident; message?: PondMessage; now: number; self: boolean }) {
  const { sprite: jumpRef, body: bodyRef } = useFrogJump(frog.jumpId ?? frog.jumpedAt ?? 0, frog.jumpedAt ?? 0, now);
  const messageBounceRef = useMessageBounce(message?.id);
  const age = frog.jumpedAt ? now - frog.jumpedAt : JUMP_MS;
  const jumping = age >= 0 && age < JUMP_MS;
  return (
    <div ref={jumpRef} className={jumping ? styles.jumping : styles.sprite}>
      {message && <div className={styles.bubble}>{message.text}</div>}
      <div className={styles.facing} data-facing={frog.facing ?? 1}>
        <div ref={messageBounceRef} className={styles.messageBounce}>
          <div ref={bodyRef} className={styles.body}><FrogPortrait /></div>
        </div>
      </div>
      <span className={styles.name}><i />{self ? "You" : frog.name}<span className={styles.srOnly}>{self ? `, ${frog.name}` : ""}</span></span>
    </div>
  );
}
type FrogProps = { frog: Resident; message?: PondMessage; self: boolean; now: number; fallbackX: number };
function Frog({ frog, message, self, now, fallbackX }: FrogProps) {
  const x = frog.x ?? fallbackX;
  const [initialX] = useState(x);
  const motion = useFrogAnimation(x, self, frog.sampledAt ?? now, now);
  return (
    <div className={styles.position} data-self={self} ref={motion} style={{ transform: `translate3d(${initialX}%, 0, 0)` }}>
      <div className={styles.resident} data-self={self} data-edge={x <= 20 ? "left" : x >= 80 ? "right" : "center"} aria-label={`${frog.name}${self ? ", your frog" : ""}`} style={{ "--resident-color": frog.color } as CSSProperties}>
        <span className={styles.shadow} />
        <Sprite frog={frog} message={message} self={self} now={now} />
      </div>
    </div>
  );
}

const jumping = (props: FrogProps) => !!props.frog.jumpedAt && props.now - props.frog.jumpedAt >= 0 && props.now - props.frog.jumpedAt < JUMP_MS;
export default memo(Frog, (previous, next) => previous.frog === next.frog && previous.message === next.message
  && previous.self === next.self && previous.fallbackX === next.fallbackX && jumping(previous) === jumping(next));
