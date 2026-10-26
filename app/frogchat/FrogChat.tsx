"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type PointerEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "../../lib/frogchat/types";
import { FrogPortrait } from "./Frog";
import PondScene from "./PondScene";
import { usePond } from "./usePond";
import { useFrogControls } from "./useFrogControls";
import styles from "./frogchat.module.css";

const media = "(max-width: 760px)";
function watchMobile(changed: () => void) {
  const query = window.matchMedia?.(media);
  query?.addEventListener("change", changed);
  return () => query?.removeEventListener("change", changed);
}
const isMobile = () => window.matchMedia?.(media).matches ?? false;
const serverMobile = () => false;
function Arrow({ left = false }: { left?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={left ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function FrogChat() {
  const pond = usePond();
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mobile = useSyncExternalStore(watchMobile, isMobile, serverMobile);
  const connected = pond.status === "connected";
  const controls = useFrogControls(connected, pond.move, pond.jump);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const me = pond.snapshot.frogs.find(frog => frog.id === pond.selfId);
  const lastMessage = pond.snapshot.messages.at(-1)?.id;

  useEffect(() => {
    if (following.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [lastMessage, historyOpen]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = draft;
    if (await pond.send(text)) {
      setDraft(current => current === text ? "" : current);
      following.current = true;
      input.current?.focus();
    }
  }
  async function invite() {
    try {
      await navigator.clipboard.writeText(new URL("/frogchat", window.location.href).href);
      setCopied(true);
    } catch { input.current?.focus(); }
  }
  function pointerDown(event: PointerEvent<HTMLButtonElement>, direction: -1 | 1) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    controls.press(`pointer-${event.pointerId}`, direction);
  }
  function pointerUp(event: PointerEvent<HTMLButtonElement>) { controls.release(`pointer-${event.pointerId}`); }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link href="/frogchat" className={styles.brand}><span><FrogPortrait /></span>frogchat<span className={styles.brandDot}>.</span></Link>
        <div className={styles.headerActions}>
          <span className={styles.presence}><span className={connected ? styles.live : styles.pending} />{pond.snapshot.frogs.length} here</span>
          <button className={styles.invite} type="button" onClick={invite}>{copied ? "Copied!" : "Invite a friend"}<span aria-hidden="true">↗</span></button>
          <button className={styles.historyToggle} type="button" aria-controls="message-history" aria-expanded={historyOpen} onClick={() => setHistoryOpen(open => !open)}>Chat</button>
        </div>
      </header>

      <main className={styles.room}>
        <PondScene snapshot={pond.snapshot} selfId={pond.selfId} now={pond.now} />
        <div className={styles.roomFooter}>
          <div className={styles.controlHelp} id="movement-help"><span><kbd>←</kbd><kbd>→</kbd> move</span><span><kbd>space</kbd> jump</span></div>
          <div className={styles.controls} role="group" aria-label="Move your frog">
            {([-1, 1] as const).map(direction => <button key={direction} type="button" className={styles.moveButton} aria-label={direction === -1 ? "Move left" : "Move right"} disabled={!connected}
              onPointerDown={event => pointerDown(event, direction)} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp}
              onClick={event => { if (event.detail === 0) pond.move(direction); }}><Arrow left={direction === -1} /></button>)}
            <button type="button" className={styles.jumpButton} disabled={!connected} onClick={() => pond.jump()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 19V9m-4 4 4-4 4 4m5 6c0-8 3-13 7-14" strokeLinecap="round" strokeLinejoin="round" /></svg>Jump</button>
          </div>
        </div>
      </main>

      <aside id="message-history" className={styles.sidebar} data-open={historyOpen} inert={mobile && !historyOpen} aria-hidden={mobile && !historyOpen ? true : undefined} aria-labelledby="history-heading">
        <div className={styles.sidebarHeading}><div><h1 id="history-heading">Conversation</h1><p>Little words. Good company.</p></div><button type="button" className={styles.closeHistory} aria-label="Close conversation" onClick={() => setHistoryOpen(false)}>×</button></div>
        <div className={styles.log} ref={log} role="log" aria-label="Message history" aria-live="polite" aria-relevant="additions" onScroll={event => { const element = event.currentTarget; following.current = element.scrollHeight - element.scrollTop - element.clientHeight < 60; }}>
          <p className={styles.welcome}>A small hello goes a long way.<br /><span>Be kind. Stay a while.</span></p>
          {!pond.snapshot.messages.length && <div className={styles.empty}><span aria-hidden="true">“</span><p>It’s quiet in here.</p><small>Say the first hello.</small></div>}
          {pond.snapshot.messages.map(message => <article key={message.id} className={styles.message} data-own={message.frogId === pond.selfId}>
            <div className={styles.messageMeta}><span className={styles.messageDot} style={{ backgroundColor: message.color }} /><strong>{message.frogId === pond.selfId ? "You" : message.name}</strong><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
            <p>{message.text}</p>
          </article>)}
        </div>
        <div className={styles.sidebarFooter}><span aria-hidden="true">❧</span> Nothing to do. Just be here.</div>
      </aside>

      <footer className={styles.composerBar}>
        <div className={styles.self}><span className={styles.avatar}><FrogPortrait /></span><span><strong>{me?.name ?? "Finding your frog…"}</strong><small role="status"><i className={connected ? styles.live : styles.pending} />{connected ? "You’re here" : pond.status === "joining" ? "Joining…" : "Reconnecting…"}</small></span></div>
        <form className={styles.composer} onSubmit={send}>
          <label className={styles.srOnly} htmlFor="frog-message">Your message</label>
          <input ref={input} id="frog-message" autoComplete="off" maxLength={MAX_MESSAGE_LENGTH} placeholder={connected ? "Say something, little frog…" : "Connecting to the room…"} value={draft} onChange={event => setDraft(event.target.value)} disabled={!connected} />
          <span className={styles.characterCount} aria-hidden="true">{draft.length}/{MAX_MESSAGE_LENGTH}</span>
          <button type="submit" aria-label={pond.sending ? "Sending message" : "Send message"} disabled={!connected || pond.sending || !draft.trim()}><Arrow /></button>
        </form>
        {pond.error && <p className={styles.error} role="alert">{pond.error}</p>}
      </footer>
    </div>
  );
}
