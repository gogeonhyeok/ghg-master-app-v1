"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MAX_MESSAGE_LENGTH, type PondSession, type PondSnapshot } from "../../lib/frogchat/types";
import { FrogPortrait } from "./Frog";
import PondScene from "./PondScene";
import styles from "./frogchat.module.css";

type Connection = "joining" | "connected" | "reconnecting";
const emptyPond: PondSnapshot = { frogs: [], messages: [], serverTime: 0 };

class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function pondRequest<T>(method: string, token?: string, body?: object): Promise<T> {
  const response = await fetch("/api/frogchat", {
    method, cache: "no-store", signal: AbortSignal.timeout(12_000),
    headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || "The pond is taking a little break.", response.status);
  return data as T;
}

function releasePad(token: string) {
  void fetch("/api/frogchat", { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, keepalive: true }).catch(() => undefined);
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function FrogChat() {
  const [snapshot, setSnapshot] = useState<PondSnapshot>(emptyPond);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection>("joining");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const [croaks, setCroaks] = useState<Record<string, number>>({});
  const [sound, setSound] = useState(false);
  const [copied, setCopied] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const clockOffset = useRef(0);
  const newestSnapshot = useRef(0);
  const seenMessages = useRef(new Set<string>());
  const hasSnapshot = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(false);
  const messageRequest = useRef<{ text: string; id: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const followLog = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const applySnapshot = useCallback((data: PondSnapshot) => {
    if (data.serverTime < newestSnapshot.current) return;
    newestSnapshot.current = data.serverTime;
    clockOffset.current = data.serverTime - Date.now();
    const fresh = data.messages.filter(message => !seenMessages.current.has(message.id));
    if (hasSnapshot.current && fresh.length) {
      const animated = fresh.filter(message => data.serverTime - message.sentAt < 10_000);
      if (animated.length) {
        setCroaks(current => {
          const next: Record<string, number> = {};
          for (const [id, expiry] of Object.entries(current)) if (expiry > data.serverTime) next[id] = expiry;
          for (const message of animated) next[message.frogId] = data.serverTime + 1100;
          return next;
        });
        const context = audioRef.current;
        if (soundRef.current && context?.state === "running") {
          const oscillator = context.createOscillator();
          const volume = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(260, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + .16);
          volume.gain.setValueAtTime(.0001, context.currentTime);
          volume.gain.exponentialRampToValueAtTime(.1, context.currentTime + .025);
          volume.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .22);
          oscillator.connect(volume); volume.connect(context.destination);
          oscillator.start(); oscillator.stop(context.currentTime + .24);
          oscillator.onended = () => { oscillator.disconnect(); volume.disconnect(); };
        }
      }
    }
    seenMessages.current = new Set(data.messages.map(message => message.id));
    hasSnapshot.current = true;
    setNow(data.serverTime);
    setSnapshot(data);
  }, []);

  useEffect(() => {
    let stopped = false;
    let inFlight = false;
    let timer: ReturnType<typeof setTimeout>;
    async function sync() {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        if (!tokenRef.current) {
          const session = await pondRequest<PondSession>("POST", undefined, { action: "join" });
          if (stopped) { releasePad(session.token); return; }
          tokenRef.current = session.token;
          setSelfId(session.selfId);
          applySnapshot(session);
        } else {
          const data = await pondRequest<PondSnapshot>("GET", tokenRef.current);
          if (stopped) return;
          applySnapshot(data);
        }
        setConnection("connected");
      } catch (cause) {
        if (stopped) return;
        if (cause instanceof RequestError && cause.status === 401) tokenRef.current = null;
        setConnection("reconnecting");
      } finally {
        inFlight = false;
        if (!stopped) timer = setTimeout(sync, 2000);
      }
    }
    function wake() { if (!document.hidden) { clearTimeout(timer); void sync(); } }
    function leave() {
      if (tokenRef.current) releasePad(tokenRef.current);
      tokenRef.current = null;
    }
    void sync();
    const clock = setInterval(() => setNow(Date.now() + clockOffset.current), 200);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      stopped = true; clearTimeout(timer); clearInterval(clock); leave();
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [applySnapshot]);

  const lastMessageId = snapshot.messages.at(-1)?.id;
  useEffect(() => {
    if (followLog.current && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lastMessageId]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => () => { void audioRef.current?.close().catch(() => undefined); }, []);

  async function send(event: FormEvent) {
    event.preventDefault();
    const token = tokenRef.current;
    const text = draft.trim();
    if (!token || !text || sending || connection !== "connected") return;
    setSending(true); setError("");
    const originalDraft = draft;
    if (messageRequest.current?.text !== text) messageRequest.current = { text, id: crypto.randomUUID() };
    try {
      const data = await pondRequest<PondSnapshot>("POST", token, { action: "message", text, requestId: messageRequest.current.id });
      // A departed session must not overwrite a newly joined pond.
      if (tokenRef.current !== token) return;
      applySnapshot(data);
      setDraft(current => current === originalDraft ? "" : current);
      messageRequest.current = null;
      followLog.current = true;
    } catch (cause) {
      setError(cause instanceof RequestError ? cause.message : "Your croak didn’t reach the pond. Try sending it again.");
      if (cause instanceof RequestError && cause.status === 401) {
        tokenRef.current = null; setConnection("reconnecting");
      }
    } finally { setSending(false); inputRef.current?.focus(); }
  }

  async function toggleSound() {
    if (!sound) {
      try {
        audioRef.current ??= new AudioContext();
        await audioRef.current.resume();
      } catch { setError("Croak sounds aren’t available in this browser."); return; }
    }
    soundRef.current = !sound;
    setSound(!sound);
  }

  async function invite() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
    catch { setError("Copy this page’s address to invite another frog."); }
  }

  const me = snapshot.frogs.find(frog => frog.id === selfId);
  const others = snapshot.frogs.filter(frog => frog.id !== selfId).length;
  const status = connection === "joining" ? "Finding your lily pad" : connection === "reconnecting" ? "Reconnecting to the pond…" : others ? `You’re sharing the pond with ${others} ${others === 1 ? "frog" : "frogs"}` : "You’re in! Waiting for more frogs to hop in";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/frogchat" className={styles.brand}><span className={styles.brandFrog}><FrogPortrait color="#88b76c" /></span>frogchat<span className={styles.brandDot}>.</span></Link>
          <div className={styles.headerRight}><span className={styles.openPond}><span />A pond for everyone</span><Link href="/" className={styles.workspaceLink}>Workspace ↗</Link></div>
        </header>

        <main className={styles.main}>
          <div className={styles.intro}>
            <div><p className={styles.eyebrow}>HOP IN. HANG OUT. SAY SOMETHING.</p><h1>A little pond.<br className={styles.mobileBreak} /> <em>A little conversation.</em></h1><p>No profiles, no pressure. Just you, a few frogs, and whatever’s on your mind.</p></div>
            <button type="button" className={styles.inviteButton} onClick={invite}>{copied ? "Pond link copied ✓" : "Invite a frog"}<ArrowIcon /></button>
          </div>

          <div className={styles.pondLayout}>
            <div className={styles.pondPanel}>
              <div className={styles.pondToolbar}><div><span className={styles.liveDot} /><strong>Sunny pond</strong><span className={styles.frogCount}>{snapshot.frogs.length} {snapshot.frogs.length === 1 ? "frog" : "frogs"} here</span></div><button type="button" aria-pressed={sound} onClick={toggleSound} className={styles.soundButton}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" strokeLinejoin="round" />{sound ? <path d="M16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" strokeLinecap="round" /> : <path d="m17 9 5 6m0-6-5 6" strokeLinecap="round" />}</svg><span>Sound {sound ? "on" : "off"}</span></button></div>
              <PondScene snapshot={snapshot} selfId={selfId} now={now} croaks={croaks} />
              <div className={styles.composerArea}>
                <div className={styles.identity}><span className={styles.identityAvatar}><FrogPortrait color={me?.color || "#88b76c"} /></span><span>Your little frog<strong>{me?.name || "Landing soon…"}</strong></span><span className={`${styles.connection} ${connection !== "connected" ? styles.connecting : ""}`} role="status"><span />{connection === "connected" ? "Connected" : connection === "joining" ? "Joining" : "Reconnecting"}</span></div>
                <form className={styles.composer} onSubmit={send}>
                  <label htmlFor="frog-message" className={styles.srOnly}>Your message to everyone in the pond</label>
                  <input ref={inputRef} id="frog-message" autoComplete="off" maxLength={MAX_MESSAGE_LENGTH} value={draft} onChange={event => setDraft(event.target.value)} placeholder={connection === "connected" ? "What’s on your mind, little frog?" : "Your lily pad is on its way…"} disabled={connection !== "connected"} aria-describedby="croak-hint" />
                  <button type="submit" disabled={!draft.trim() || sending || connection !== "connected"}>{sending ? "Sending…" : "Croak"}<ArrowIcon /></button>
                </form>
                <div className={styles.composerHint}><p id="croak-hint">Enter to croak · Everyone in the pond can hear you</p><span>{draft.length}/{MAX_MESSAGE_LENGTH}</span></div>
                {error && <p className={styles.error} role="alert">{error}</p>}
              </div>
            </div>

            <aside className={styles.chatPanel} aria-labelledby="pond-chat-heading">
              <div className={styles.chatHeading}><div><p className={styles.eyebrow}>LITTLE WORDS, GOOD COMPANY</p><h2 id="pond-chat-heading">Pond chatter</h2></div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z" /><path d="M7 10h8m-8 4h5" strokeLinecap="round" /></svg></div>
              <div className={styles.chatLog} ref={logRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Messages in the pond" onScroll={event => { const log = event.currentTarget; followLog.current = log.scrollHeight - log.scrollTop - log.clientHeight < 60; }}>
                <div className={styles.welcome}><span className={styles.welcomeFlower}>✳</span><h3>You found your people.<br />Well, your frogs.</h3><p>You’ll automatically meet everyone who hops in. Say hello and let the conversation wander.</p><span className={styles.welcomeRule}>Be kind. Keep it light. Ribbit.</span></div>
                {!snapshot.messages.length && <div className={styles.emptyChat}><span>〰</span><p>The first croak is yours.</p><small>A hello goes a long way.</small></div>}
                {snapshot.messages.map(message => <div key={message.id} className={`${styles.chatMessage} ${message.frogId === selfId ? styles.ownMessage : ""}`}><span className={styles.messageAvatar}><FrogPortrait color={message.color} /></span><div><div className={styles.messageMeta}><strong>{message.frogId === selfId ? "You" : message.name}</strong><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p>{message.text}</p></div></div>)}
              </div>
              <div className={styles.chatFooter}><span className={styles.littleLeaf}>❧</span>Some days, a small hello is enough.</div>
            </aside>
          </div>

          <div className={styles.belowPond}><p role="status"><span className={connection === "connected" ? styles.statusDot : styles.pendingDot} />{status}</p><span>No sign-up. Just hop in.</span></div>
        </main>
        <footer className={styles.footer}><span>Made for a slower kind of social.</span><span>Take a breath. Have a croak. <span aria-hidden="true">✳</span></span></footer>
      </div>
    </div>
  );
}
