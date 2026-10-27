import "server-only";

import type WebSocket from "ws";
import { sessionTokenPattern } from "./http";
import { publishPondMotion, subscribePondChanges } from "./realtime";
import { actInPond, PondError, readPond } from "./store";
import { PRESENCE_MS, type FrogAction, type PondServerEvent } from "./types";

export function acceptPondSocket(socket: WebSocket) {
  let closed = false;
  let token: string | null = null;
  let authenticating = false;
  let unsubscribe: (() => void) | undefined;
  let refreshing = false;
  let dirty = false;
  let lastHeartbeat = 0;
  let selfId: string | undefined;
  let initialized = false;
  let lastSequence = 0;
  let processing = false;
  const actions: { action: FrogAction; seq: number; receivedAt: number }[] = [];
  let deadline = setTimeout(() => socket.close(1008, "Authenticate first"), 10_000);

  function cleanup() {
    closed = true;
    clearTimeout(deadline);
    actions.length = 0;
    unsubscribe?.();
  }
  function send(event: PondServerEvent) {
    if (closed || socket.readyState !== 1) return;
    if (socket.bufferedAmount > 256 * 1024) { socket.close(1013, "Slow connection"); return; }
    socket.send(JSON.stringify(event));
  }
  function fail(error: unknown) {
    if (closed) return;
    const status = error instanceof PondError ? error.status : 503;
    send({ type: "error", status, message: status === 401 ? "Your lily pad drifted away. Joining again…" : "The pond is reconnecting. Please wait." });
    socket.close(status === 401 ? 4401 : 1013, "Reconnect to the pond");
  }
  function resetDeadline() {
    clearTimeout(deadline);
    deadline = setTimeout(() => socket.close(1008, "Heartbeat timed out"), PRESENCE_MS);
  }
  async function refresh() {
    dirty = true;
    if (refreshing || !token || closed) return;
    refreshing = true;
    try {
      while (dirty && !closed) {
        dirty = false;
        // Reading also renews presence. Heartbeats reconcile dropped pub/sub events
        // and remove expired residents/messages without recurring HTTP requests.
        send({ type: "snapshot", snapshot: await readPond(token) });
      }
    } catch (error) { fail(error); }
    finally { refreshing = false; }
  }
  async function processActions() {
    if (processing || !token || closed) return;
    processing = true;
    try {
      while (actions.length && !closed) {
        const input = actions.shift()!;
        const result = await actInPond(token, input.action, input.receivedAt);
        if (closed) break;
        selfId = result.frog.id;
        // Acknowledge even rate-limited actions so prediction can discard them.
        send({ type: "ack", seq: input.seq, frog: result.frog, accepted: result.accepted, serverTime: Date.now() });
        if (result.accepted) await publishPondMotion(result.pond, result.frog);
      }
    } catch (error) { fail(error); }
    finally { processing = false; }
  }
  socket.on("close", cleanup);
  socket.on("error", cleanup);
  socket.on("message", async (data, binary) => {
    if (closed) return;
    if (binary) { socket.close(1008, "Text events only"); return; }
    let event: { type?: string; token?: string; direction?: unknown; seq?: unknown; jumpId?: unknown };
    try {
      event = JSON.parse(data.toString());
      if (!event || typeof event !== "object") throw new Error("Invalid event");
    } catch { socket.close(1008, "Invalid event"); return; }
    if (event.type === "authenticate" && !token && !authenticating && typeof event.token === "string" && sessionTokenPattern.test(event.token)) {
      authenticating = true;
      try {
        // Authenticate before joining the shared subscription, then subscribe before
        // reading the initial snapshot so writes during setup cannot be missed.
        const initial = await readPond(event.token);
        if (closed) return;
        const remove = await subscribePondChanges(motion => {
          if (motion && !initialized) { dirty = true; return; }
          if (motion) { if (motion.frog.id !== selfId) send(motion); }
          else void refresh();
        }, () => socket.close(1013, "Broadcast unavailable"), initial.pond);
        if (closed) { remove(); return; }
        unsubscribe = remove;
        token = event.token;
        resetDeadline();
        await refresh();
        initialized = true;
      } catch (error) { fail(error); }
      return;
    }
    if (event.type === "heartbeat" && token) {
      if (Date.now() - lastHeartbeat < 10_000) return;
      lastHeartbeat = Date.now();
      resetDeadline();
      await refresh();
      return;
    }
    if (token && (event.type === "jump" || (event.type === "move" && (event.direction === -1 || event.direction === 1)))) {
      if (!Number.isSafeInteger(event.seq) || (event.seq as number) <= lastSequence ||
          (event.jumpId !== undefined && (typeof event.jumpId !== "string" || !/^[\w-]{1,64}$/.test(event.jumpId)))) {
        socket.close(1008, "Invalid action sequence"); return;
      }
      if (actions.length >= 32) { socket.close(1013, "Too many pending actions"); return; }
      lastSequence = event.seq as number;
      actions.push({ seq: lastSequence, receivedAt: Date.now(), action: event.type === "jump" ? { type: "jump", jumpId: event.jumpId as string | undefined } : { type: "move", direction: event.direction as -1 | 1 } });
      void processActions();
      return;
    }
    socket.close(1008, "Unexpected event");
  });
}
