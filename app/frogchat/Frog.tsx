import { useState, type CSSProperties } from "react";
import { JUMP_MS, type Frog as Resident, type PondMessage } from "../../lib/frogchat/types";
import styles from "./frogchat.module.css";

export function FrogPortrait() {
  return <svg viewBox="0 0 51 51" aria-hidden="true" className={styles.frogImage}><image href="/frogchat/frog.svg" width="51" height="51" /></svg>;
}
function Sprite({ frog, message, age }: { frog: Resident; message?: PondMessage; age: number }) {
  const [delay] = useState(() => -Math.max(0, age));
  const jumping = age >= 0 && age < JUMP_MS;
  return (
    <div className={jumping ? styles.jumping : styles.sprite} style={{ "--jump-delay": `${delay}ms` } as CSSProperties}>
      {message && <div className={styles.bubble}>{message.text}</div>}
      <div className={styles.facing} data-facing={frog.facing ?? 1}><FrogPortrait /></div>
    </div>
  );
}
export default function Frog({ frog, message, self, now, fallbackX }: { frog: Resident; message?: PondMessage; self: boolean; now: number; fallbackX: number }) {
  const x = frog.x ?? fallbackX;
  return (
    <div className={styles.resident} data-self={self} data-edge={x <= 20 ? "left" : x >= 80 ? "right" : "center"} aria-label={`${frog.name}${self ? ", your frog" : ""}`} style={{ left: `${x}%`, "--resident-color": frog.color } as CSSProperties}>
      <span className={styles.shadow} />
      <Sprite key={frog.jumpedAt ?? 0} frog={frog} message={message} age={frog.jumpedAt ? now - frog.jumpedAt : JUMP_MS} />
      <span className={styles.name}><i />{self ? "You" : frog.name}<span className={styles.srOnly}>{self ? `, ${frog.name}` : ""}</span></span>
    </div>
  );
}
