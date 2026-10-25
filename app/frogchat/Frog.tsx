import type { CSSProperties } from "react";
import type { Frog as PondFrog, PondMessage } from "../../lib/frogchat/types";
import FrogArtwork from "./FrogArtwork";
import styles from "./frogchat.module.css";

export function FrogPortrait({ color, croaking = false }: { color: string; croaking?: boolean }) {
  return (
    <svg viewBox="0 0 160 130" fill="none" aria-hidden="true" className={`${styles.frogDrawing} ${croaking ? styles.croaking : ""}`} style={{ "--frog-color": color } as CSSProperties}>
      <ellipse cx="80" cy="115" rx="54" ry="8" fill="#325838" opacity=".12" />
      <FrogArtwork />
      <g className={styles.croakLines} stroke="#588557" strokeWidth="2.5" strokeLinecap="round"><path d="M18 51L11 47M16 65H7M142 51L149 47M144 65H153" /></g>
    </svg>
  );
}

export default function Frog({ frog, message, isSelf, croaking }: { frog: PondFrog; message?: PondMessage; isSelf: boolean; croaking: boolean }) {
  return (
    <div className={`${styles.resident} ${isSelf ? styles.selfResident : ""}`} aria-label={`${frog.name}${isSelf ? ", your frog" : ""}`}>
      {message && <div key={message.id} className={styles.bubble}>{message.text}</div>}
      <div className={styles.frogOnPad}>
        <svg className={styles.lilyPad} viewBox="0 0 180 62" aria-hidden="true"><ellipse cx="90" cy="34" rx="84" ry="24" fill="#749d63" opacity=".18" /><path d="M90 5C136 5 170 14 170 30S136 53 90 53S10 45 10 30S43 5 90 5L83 29L111 7" fill={isSelf ? "#6da45f" : "#8cb57d"} /><path d="M30 29L76 31M99 37L142 40M59 44L81 35" stroke="#53894f" strokeWidth="1.5" opacity=".45" /></svg>
        <FrogPortrait color={frog.color} croaking={croaking} />
      </div>
      <span className={styles.frogName}>{isSelf && <span className={styles.youDot} />}{frog.name}{isSelf && <small>you</small>}</span>
    </div>
  );
}
