import { HEARTBEAT_MS, type PondClientEvent, type PondServerEvent, type PondSnapshot } from "./types";

type Callbacks = {
  snapshot: (snapshot: PondSnapshot) => void;
  status: (connected: boolean) => void;
  expired: () => void;
};

// Browser transport only. HTTP is used for join/send/leave, never recurring reads.
export function connectPond(token: string, callbacks: Callbacks) {
  let stopped = false;
  let socket: WebSocket | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let retryDelay = 1000;
  let ready = false;
  let receivedAt = 0;

  function clearTimers() {
    clearTimeout(deadline);
    clearInterval(heartbeat);
  }
  function send(event: PondClientEvent) {
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(event));
    return true;
  }
  function schedule() {
    if (stopped || retry) return;
    callbacks.status(false);
    retry = setTimeout(() => { retry = undefined; connect(); }, retryDelay + Math.random() * 250);
    retryDelay = Math.min(retryDelay * 2, 30_000);
  }
  function connect() {
    if (stopped) return;
    ready = false;
    const url = new URL("/api/frogchat/ws", window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    let current: WebSocket;
    try { current = new WebSocket(url); }
    catch { schedule(); return; }
    socket = current;
    deadline = setTimeout(() => current.close(), 15_000);
    current.onopen = () => {
      if (stopped || current !== socket) return;
      send({ type: "authenticate", token });
    };
    current.onmessage = event => {
      if (stopped || current !== socket) return;
      let data: PondServerEvent;
      try { data = JSON.parse(event.data); }
      catch { current.close(); return; }
      if (data?.type === "error") {
        if (data.status === 401) {
          stopped = true;
          clearTimers();
          current.close();
          callbacks.status(false);
          callbacks.expired();
        } else current.close();
        return;
      }
      if (data?.type !== "snapshot" || !data.snapshot || !Array.isArray(data.snapshot.frogs) || !Array.isArray(data.snapshot.messages) || !Number.isFinite(data.snapshot.serverTime)) {
        current.close(); return;
      }
      receivedAt = Date.now();
      callbacks.snapshot(data.snapshot);
      if (!ready) {
        ready = true;
        retryDelay = 1000;
        clearTimeout(deadline);
        callbacks.status(true);
        heartbeat = setInterval(() => {
          if (Date.now() - receivedAt > HEARTBEAT_MS * 2 + 10_000) current.close();
          else send({ type: "heartbeat" });
        }, HEARTBEAT_MS);
      }
    };
    current.onerror = () => current.close();
    current.onclose = event => {
      if (stopped || current !== socket) return;
      ready = false;
      clearTimers();
      if (event.code === 4401) {
        stopped = true;
        callbacks.status(false);
        callbacks.expired();
      } else schedule();
    };
  }
  connect();
  return {
    move(direction: -1 | 1) { return ready && !stopped && send({ type: "move", direction }); },
    jump() { return ready && !stopped && send({ type: "jump" }); },
    refresh() {
      if (stopped) return;
      if (ready) send({ type: "heartbeat" });
      else if (!socket || socket.readyState === WebSocket.CLOSED) {
        clearTimeout(retry); retry = undefined; connect();
      }
    },
    close() {
      stopped = true;
      clearTimeout(retry);
      clearTimers();
      socket?.close();
    },
  };
}
