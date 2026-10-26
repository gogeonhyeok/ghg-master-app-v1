"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { connectPond } from "../../lib/frogchat/connection";
import { BUBBLE_MS, JUMP_MS, type PondSession, type PondSnapshot } from "../../lib/frogchat/types";

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

  const apply = useCallback((data: PondSnapshot) => {
    if (data.serverTime < latest.current) return;
    latest.current = data.serverTime;
    offset.current = data.serverTime - Date.now();
    setNow(data.serverTime);
    setSnapshot(data);
  }, []);

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
          setSelfId(session.selfId);
          apply(session);
        }
        const sessionToken = token.current;
        subscription.current = connectPond(sessionToken, {
          snapshot: data => { if (!stopped && token.current === sessionToken) apply(data); },
          status: connected => {
            if (stopped) return;
            setStatus(connected ? "connected" : "reconnecting");
            if (connected) setError("");
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
  }, [apply]);

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
    try {
      const data = await request<PondSnapshot>(sessionToken, { action: "message", text: trimmed, requestId: pendingMessage.current.id });
      if (token.current !== sessionToken) return false;
      apply(data); pendingMessage.current = null;
      return true;
    } catch (cause) {
      if (token.current !== sessionToken) return false;
      setError(cause instanceof RequestError ? cause.message : "Your message didn’t arrive. Please try again.");
      if (cause instanceof RequestError && cause.status === 401) reconnect.current();
      return false;
    } finally { sendingRef.current = false; setSending(false); }
  }
  const move = useCallback((direction: -1 | 1) => subscription.current?.move(direction) ?? false, []);
  const jump = useCallback(() => subscription.current?.jump() ?? false, []);
  return { snapshot, selfId, status, error, sending, now, send, move, jump };
}
