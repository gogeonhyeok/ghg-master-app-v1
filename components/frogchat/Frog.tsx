import type { CSSProperties } from "react";
import type { Frog as PondFrog, PondMessage } from "../../lib/frogchat/types";
import styles from "./frogchat.module.css";

export function FrogPortrait({ color, croaking = false }: { color: string; croaking?: boolean }) {
  return (
    <svg viewBox="0 0 160 130" fill="none" aria-hidden="true" className={`${styles.frogDrawing} ${croaking ? styles.croaking : ""}`} style={{ "--frog-color": color } as CSSProperties}>
      <ellipse cx="80" cy="115" rx="54" ry="8" fill="#325838" opacity=".12" />
      <g className={styles.frogBody}>
        <path d="M42 73C24 67 14 92 28 103L52 109M118 73C136 67 146 92 132 103L108 109" fill="var(--frog-color)" stroke="#426044" strokeWidth="2.5" />
        <path d="M41 83C34 99 41 114 58 113H103C121 113 127 98 119 83L110 48H50L41 83Z" fill="var(--frog-color)" stroke="#426044" strokeWidth="2.5" />
        <ellipse className={styles.throat} cx="80" cy="91" rx="28" ry="20" fill="#f1ecc0" />
        <path d="M29 110L22 113M33 112L31 117M38 113L38 118M131 110L138 113M127 112L129 117M122 113L122 118" stroke="#426044" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M39 48C38 30 55 19 67 33C73 30 87 30 93 33C105 19 122 30 121 48C138 60 133 82 116 87C98 94 62 94 44 87C27 82 22 60 39 48Z" fill="var(--frog-color)" stroke="#426044" strokeWidth="2.5" />
        <ellipse cx="52" cy="45" rx="12" ry="14" fill="#fffef0" />
        <ellipse cx="108" cy="45" rx="12" ry="14" fill="#fffef0" />
        <g className={styles.frogEyes}>
          <ellipse cx="54" cy="46" rx="5" ry="7" fill="#2c4632" /><ellipse cx="106" cy="46" rx="5" ry="7" fill="#2c4632" />
          <circle cx="56" cy="43" r="1.7" fill="white" /><circle cx="108" cy="43" r="1.7" fill="white" />
        </g>
        <ellipse cx="43" cy="70" rx="8" ry="4" fill="#ebad9e" opacity=".8" /><ellipse cx="117" cy="70" rx="8" ry="4" fill="#ebad9e" opacity=".8" />
        <path className={styles.closedMouth} d="M61 69Q80 85 99 69" stroke="#345339" strokeWidth="2.5" strokeLinecap="round" />
        <g className={styles.openMouth}><ellipse cx="80" cy="73" rx="13" ry="10" fill="#345339" /><path d="M73 79Q80 73 87 79" stroke="#eaa392" strokeWidth="4" strokeLinecap="round" /></g>
        <path d="M51 90L55 106M109 90L105 106" stroke="#426044" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 108L47 111M55 109L55 114M58 108L62 111M108 108L113 111M105 109L105 114M102 108L98 111" stroke="#426044" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="68" cy="61" r="1.5" fill="#527749" /><circle cx="92" cy="61" r="1.5" fill="#527749" />
      </g>
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
