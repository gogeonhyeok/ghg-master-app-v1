"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectPond } from "../../lib/frogchat/connection";
import { BUBBLE_MS, JUMP_MS, type Frog, type FrogAction, type PondMessage, type PondSession, type PondSnapshot } from "../../lib/frogchat/types";
import { newerFrog, replayActions, type PendingAction } from "../../lib/frogchat/motion";

const empty: PondSnapshot = { frogs: [], messages: [], serverTime: 0 };
class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(token?: string, body?: object): Promise<T> {
  const response = await fetch("/api/frogchat", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000),
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new RequestError(data.error || "The room is temporarily unavailable.", response.status);
  return data as T;
}
function release(token: string) {
  void fetch("/api/frogchat", { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, keepalive: true }).catch(() => undefined);
}

export function usePond() {
  const [snapshot, setSnapshot] = useState(empty);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [status, setStatus] = useState<"joining" | "connected" | "reconnecting">("joining");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(0);
  const token = useRef<string | null>(null);
  const subscription = useRef<ReturnType<typeof connectPond> | null>(null);
  const reconnect = useRef<() => void>(() => undefined);
  const latest = useRef(0);
  const offset = useRef(0);
  const pendingMessage = useRef<{ text: string; id: string } | null>(null);
  const sendingRef = useRef(false);
  const confirmed = useRef(empty);
  const identity = useRef<string | null>(null);
  const pending = useRef<PendingAction[]>([]);
  const clockReady = useRef(false);
  const optimisticMessage = useRef<PondMessage | null>(null);
  const localMessageTimes = useRef(new Map<string, number>());

  const commit = useCallback(() => {
    const data = confirmed.current;
    const message = optimisticMessage.current;
    setSnapshot({ ...data,
      messages: message && !data.messages.some(item => item.id === message.id) ? [...data.messages, message].slice(-100) : data.messages,
      frogs: data.frogs.map(frog => frog.id === identity.current ? replayActions(frog, pending.current) : frog),
    });
    setNow(Date.now() + offset.current);
  }, []);

  const apply = useCallback((data: PondSnapshot) => {
    if (data.serverTime < latest.current) return;
    latest.current = data.serverTime;
    const sample = data.serverTime - Date.now();
    offset.current = clockReady.current ? Math.max(offset.current, sample) : sample;
    clockReady.current = true;
    const previous = new Map(confirmed.current.frogs.map(frog => [frog.id, frog]));
    confirmed.current = { ...data,
      // Saving a slow message must not restart its three-second local bubble.
      messages: data.messages.map(message => localMessageTimes.current.has(message.id) ? { ...message, sentAt: localMessageTimes.current.get(message.id)! } : message),
      frogs: data.frogs.map(frog => {
        const old = previous.get(frog.id);
        // Only acknowledgements can advance our baseline while inputs are pending.
        return frog.id === identity.current && pending.current.length && old ? old : newerFrog(old, frog);
      }),
    };
    commit();
  }, [commit]);

  const updateFrog = useCallback((frog: Frog) => {
    const data = confirmed.current;
    const old = data.frogs.find(item => item.id === frog.id);
    const updated = newerFrog(old, frog);
    confirmed.current = { ...data, frogs: old ? data.frogs.map(item => item.id === frog.id ? updated : item) : [...data.frogs, updated] };
    commit();
  }, [commit]);

  useEffect(() => {
    let stopped = false;
    let suspended = false;
    let inFlight = false;
    let retry: ReturnType<typeof setTimeout>;
    let retryDelay = 1000;
    async function connect() {
      if (stopped || suspended || inFlight || subscription.current) return;
      inFlight = true;
      try {
        if (!token.current) {
          // One shared room; old scene invitation parameters no longer split users.
          const session = await request<PondSession>(undefined, { action: "join", pond: "classic" });
          if (stopped || suspended) { release(session.token); return; }
          token.current = session.token;
          identity.current = session.selfId;
          pending.current = [];
          optimisticMessage.current = null;
          setSelfId(session.selfId);
          apply(session);
        }
        const sessionToken = token.current;
        subscription.current = connectPond(sessionToken, {
          snapshot: data => { if (!stopped && token.current === sessionToken) apply(data); },
          motion: event => {
            if (!stopped && token.current === sessionToken && (event.serverTime >= latest.current || confirmed.current.frogs.some(frog => frog.id === event.frog.id))) updateFrog(event.frog);
          },
          acknowledged: event => {
            if (stopped || token.current !== sessionToken || event.frog.id !== identity.current) return;
            pending.current = pending.current.filter(input => input.seq > event.seq);
            updateFrog(event.frog);
          },
          status: connected => {
            if (stopped) return;
            setStatus(connected ? "connected" : "reconnecting");
            if (connected) setError("");
            else { pending.current = []; commit(); }
          },
          expired: () => {
            if (stopped || token.current !== sessionToken) return;
            subscription.current?.close();
            subscription.current = null;
            token.current = null;
            void connect();
          },
        });
        retryDelay = 1000;
      } catch (cause) {
        if (stopped || suspended) return;
        setStatus("reconnecting");
        setError(cause instanceof RequestError ? cause.message : "Couldn’t join the room. Trying again…");
        retry = setTimeout(() => { void connect(); }, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      } finally { inFlight = false; }
    }
    function leave() {
      suspended = true;
      clearTimeout(retry);
      subscription.current?.close();
      subscription.current = null;
      if (token.current) release(token.current);
      token.current = null;
    }
    function wake() {
      if (document.hidden || stopped) return;
      suspended = false;
      if (subscription.current) subscription.current.refresh();
      else { clearTimeout(retry); void connect(); }
    }
    reconnect.current = () => {
      subscription.current?.close(); subscription.current = null;
      token.current = null; setStatus("reconnecting"); void connect();
    };
    void connect();
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      stopped = true; leave();
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [apply, commit, updateFrog]);

  // Only wake when a bubble/jump expires; no idle animation or clock polling.
  useEffect(() => {
    const expiry = Math.min(...snapshot.messages.map(message => message.sentAt + BUBBLE_MS).concat(snapshot.frogs.map(frog => (frog.jumpedAt ?? 0) + JUMP_MS)).filter(time => time > now));
    if (!Number.isFinite(expiry)) return;
    const timer = setTimeout(() => setNow(Date.now() + offset.current), Math.max(1, expiry - now + 1));
    return () => clearTimeout(timer);
  }, [snapshot, now]);

  async function send(text: string) {
    const sessionToken = token.current;
    if (!sessionToken || status !== "connected" || sendingRef.current || !text.trim()) return false;
    sendingRef.current = true; setSending(true); setError("");
    const trimmed = text.trim();
    if (pendingMessage.current?.text !== trimmed) pendingMessage.current = { text: trimmed, id: crypto.randomUUID() };
    const me = confirmed.current.frogs.find(frog => frog.id === identity.current);
    if (me) {
      optimisticMessage.current = { id: `${me.id}:${pendingMessage.current.id}`, frogId: me.id, name: me.name, color: me.color, text: trimmed, sentAt: Date.now() + offset.current, pending: true };
      localMessageTimes.current.set(optimisticMessage.current.id, optimisticMessage.current.sentAt);
      if (localMessageTimes.current.size > 100) localMessageTimes.current.delete(localMessageTimes.current.keys().next().value!);
      commit();
    }
    try {
      const data = await request<PondSnapshot>(sessionToken, { action: "message", text: trimmed, requestId: pendingMessage.current.id });
      if (token.current !== sessionToken) return false;
      optimisticMessage.current = null;
      apply(data); commit(); pendingMessage.current = null;
      return true;
    } catch (cause) {
      if (token.current !== sessionToken) return false;
      optimisticMessage.current = null; commit();
      setError(cause instanceof RequestError ? cause.message : "Your message didn’t arrive. Please try again.");
      if (cause instanceof RequestError && cause.status === 401) reconnect.current();
      return false;
    } finally { sendingRef.current = false; setSending(false); }
  }
  const predict = useCallback((action: FrogAction) => {
    const connection = subscription.current;
    const base = confirmed.current.frogs.find(frog => frog.id === identity.current);
    if (!connection || !base || pending.current.length >= 32) return false;
    const at = Date.now() + offset.current;
    const current = replayActions(base, pending.current);
    if (action.type === "jump" && at - (current.jumpedAt ?? 0) < JUMP_MS) return false;
    const seq = action.type === "move" ? connection.move(action.direction) : connection.jump(action.jumpId!);
    if (seq === false) return false;
    pending.current.push({ seq, action, at });
    commit();
    return true;
  }, [commit]);
  const move = useCallback((direction: -1 | 1) => predict({ type: "move", direction }), [predict]);
  const jump = useCallback(() => predict({ type: "jump", jumpId: crypto.randomUUID() }), [predict]);
  return { snapshot, selfId, status, error, sending, now, send, move, jump };
}
