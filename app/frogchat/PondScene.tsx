import type { CSSProperties } from "react";
import { BUBBLE_MS, type PondSnapshot } from "../../lib/frogchat/types";
import Frog from "./Frog";
import styles from "./frogchat.module.css";

function SwampLandscape() {
  return (
    <svg className={styles.landscape} viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path fill="#e6efd0" d="M0 0H1000V650H0z" />
      <circle cx="792" cy="112" r="53" fill="#fbdf8d" /><circle cx="792" cy="112" r="70" stroke="#fbdf8d" strokeWidth="1.5" strokeDasharray="3 13" />
      <g fill="#f8fae9"><path d="M103 112C82 112 76 89 96 81C89 53 131 47 141 68C161 51 182 68 178 86C205 85 207 111 185 112Z" /><path d="M481 84C461 84 464 64 479 61C477 39 511 37 516 55C541 46 556 66 543 81Z" /></g>
      <path d="M0 209C89 140 159 181 233 189C366 115 430 179 503 183C623 130 660 177 721 196C829 149 905 166 1000 206V650H0Z" fill="#c1d69e" />
      <path d="M0 243C98 196 167 260 239 241C332 181 419 234 493 230C583 198 682 254 746 234C860 177 940 229 1000 239V650H0Z" fill="#a8c88a" />
      <path d="M0 294C196 240 284 291 431 264C623 229 768 281 1000 275V650H0Z" fill="#93bd96" />
      <path d="M0 337C192 270 371 306 508 299C738 281 876 282 1000 316V650H0Z" fill="#bbdac3" />
      <path d="M0 434C133 398 241 441 374 416C582 376 746 423 1000 391V650H0Z" fill="#a5ceb5" opacity=".55" />
      <g stroke="#eff5da" strokeWidth="3" strokeLinecap="round" opacity=".65"><path d="M222 331H284M641 334H728M487 391H539M843 489H900M89 492H165M394 573H455M713 579H750" /></g>
      <g fill="#8bb77b"><ellipse cx="105" cy="351" rx="31" ry="10" /><ellipse cx="824" cy="388" rx="23" ry="8" /><ellipse cx="670" cy="466" rx="28" ry="9" /><ellipse cx="205" cy="570" rx="25" ry="8" /></g>
      <g stroke="#5e8c59" strokeWidth="6" strokeLinecap="round"><path d="M22 375Q48 298 35 232M38 378Q68 312 73 259M16 380Q6 321 0 302M944 351Q938 280 956 220M963 360Q971 285 991 265M982 372Q1007 314 1000 297" /></g>
      <g stroke="#8e8153" strokeWidth="11" strokeLinecap="round"><path d="M35 231L33 207M73 258L76 234M956 218L964 191M991 264L999 241" /></g>
      <path d="M0 600C51 541 83 589 123 572C160 608 198 576 219 650H0Z" fill="#91b575" /><path d="M1000 555C935 511 915 574 878 555C829 594 806 586 783 650H1000Z" fill="#91b575" />
      <g stroke="#668d51" strokeWidth="4" strokeLinecap="round"><path d="M28 650Q21 609 10 598M48 650Q52 594 73 573M74 650Q83 617 104 606M924 650Q905 606 894 599M947 650Q948 592 965 578M979 650Q976 609 995 590" /></g>
      <g fill="#f8eac2"><circle cx="110" cy="604" r="7" /><circle cx="73" cy="572" r="6" /><circle cx="891" cy="598" r="7" /></g>
      <g fill="#efb99e"><circle cx="110" cy="604" r="3" /><circle cx="73" cy="572" r="2.5" /><circle cx="891" cy="598" r="3" /></g>
      <g className={styles.dragonfly}><ellipse cx="363" cy="223" rx="14" ry="4" fill="#fcfbe8" transform="rotate(-25 363 223)" /><ellipse cx="386" cy="224" rx="14" ry="4" fill="#fcfbe8" transform="rotate(25 386 224)" /><path d="M375 221L372 240" stroke="#63897b" strokeWidth="3" strokeLinecap="round" /></g>
    </svg>
  );
}

export default function PondScene({ snapshot, selfId, now, croaks }: { snapshot: PondSnapshot; selfId: string | null; now: number; croaks: Record<string, number> }) {
  return (
    <section className={styles.scene} aria-label="Shared sunny pond" style={{ "--frog-columns": Math.max(1, Math.min(4, snapshot.frogs.length)) } as CSSProperties}>
      <SwampLandscape />
      <div className={styles.pondSign}><span className={styles.signFlower}>✳</span><span>THE SUNNY POND<small>Everyone’s welcome here</small></span></div>
      <span className={styles.weather}>24° <span aria-hidden="true">☀</span> & pleasantly pondy</span>
      <div className={styles.residents}>
        {snapshot.frogs.map(frog => {
          const latest = snapshot.messages.findLast(message => message.frogId === frog.id);
          return <Frog key={frog.id} frog={frog} isSelf={frog.id === selfId} message={latest && now - latest.sentAt < BUBBLE_MS ? latest : undefined} croaking={(croaks[frog.id] || 0) > now} />;
        })}
      </div>
      {!snapshot.frogs.length && <div className={styles.landing}><span className={styles.landingRipple} /><p>Finding your lily pad…</p></div>}
      {snapshot.frogs.length === 1 && <p className={styles.waitingNote}>A peaceful moment. The next frog will land right here.</p>}
      <span className={styles.pondCaption}>a good place to just be.</span>
    </section>
  );
}
