import "server-only";

import type WebSocket from "ws";
import { sessionTokenPattern } from "./http";
import { publishPondChange, subscribePondChanges } from "./realtime";
import { actInPond, PondError, readPond } from "./store";
import { PRESENCE_MS, type PondServerEvent } from "./types";

export function acceptPondSocket(socket: WebSocket) {
  let closed = false;
  let token: string | null = null;
  let authenticating = false;
  let unsubscribe: (() => void) | undefined;
  let refreshing = false;
  let dirty = false;
  let lastHeartbeat = 0;
  let moving = false;
  let jumping = false;
  let deadline = setTimeout(() => socket.close(1008, "Authenticate first"), 10_000);

  function cleanup() {
    closed = true;
    clearTimeout(deadline);
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
  socket.on("close", cleanup);
  socket.on("error", cleanup);
  socket.on("message", async (data, binary) => {
    if (closed) return;
    if (binary) { socket.close(1008, "Text events only"); return; }
    let event: { type?: string; token?: string; direction?: unknown };
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
        const remove = await subscribePondChanges(() => { void refresh(); }, () => socket.close(1013, "Broadcast unavailable"), initial.pond);
        if (closed) { remove(); return; }
        unsubscribe = remove;
        token = event.token;
        resetDeadline();
        await refresh();
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
      const jump = event.type === "jump";
      if (jump ? jumping : moving) return;
      if (jump) jumping = true; else moving = true;
      try {
        const pond = await actInPond(token, jump ? { type: "jump" } : { type: "move", direction: event.direction as -1 | 1 });
        if (pond) await publishPondChange(pond);
      } catch (error) { fail(error); }
      finally { if (jump) jumping = false; else moving = false; }
      return;
    }
    socket.close(1008, "Unexpected event");
  });
}
