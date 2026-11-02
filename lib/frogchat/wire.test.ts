/** @jest-environment node */
import { expect, it, jest } from "@jest/globals";
import WebSocket, { WebSocketServer } from "ws";
import { once } from "node:events";

jest.mock("server-only", () => ({}));

import { acceptPondSocket } from "./socket";
import { publishPondChange } from "./realtime";
import { joinPond, leavePond, speakInPond } from "./store";
import type { PondSnapshot, PondServerEvent } from "./types";

function nextEvent(socket: WebSocket, matches: (event: PondServerEvent) => boolean) {
  return new Promise<PondServerEvent>((resolve, reject) => {
    const timeout = setTimeout(() => { cleanup(); reject(new Error("Snapshot timed out")); }, 5000);
    function cleanup() { clearTimeout(timeout); socket.off("message", receive); socket.off("error", failed); }
    function failed(error: Error) { cleanup(); reject(error); }
    function receive(data: WebSocket.RawData) {
      const event = JSON.parse(data.toString());
      if (matches(event)) { cleanup(); resolve(event); }
    }
    socket.on("message", receive);
    socket.on("error", failed);
  });
}

async function nextSnapshot(socket: WebSocket, matches: (snapshot: PondSnapshot) => boolean) {
  const event = await nextEvent(socket, event => event.type === "snapshot" && matches(event.snapshot));
  if (event.type !== "snapshot") throw Error("Expected snapshot");
  return event.snapshot;
}

it("delivers and recovers croaks over real WebSocket connections", async () => {
  const keys = ["MONGODB_URI", "MONGODB_URL", "REDIS_URL", "FROGCHAT_REDIS_URL", "VERCEL"] as const;
  const previous = keys.map(key => process.env[key]);
  keys.forEach(key => delete process.env[key]);
  const server = new WebSocketServer({ host: "127.0.0.1", port: 0 });
  const clients: WebSocket[] = [];
  server.on("connection", acceptPondSocket);
  try {
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No socket address");
    async function connect(token: string) {
      const socket = new WebSocket(`ws://127.0.0.1:${(address as { port: number }).port}`);
      clients.push(socket);
      const initial = nextSnapshot(socket, () => true);
      await once(socket, "open");
      socket.send(JSON.stringify({ type: "authenticate", token }));
      await initial;
      return socket;
    }
    const first = await joinPond(); const second = await joinPond();
    const a = await connect(first.token); const b = await connect(second.token);
    const delivered = nextSnapshot(b, snapshot => snapshot.messages.some(message => message.text === "Live croak"));
    await speakInPond(first.token, "Live croak", "one");
    await publishPondChange();
    expect((await delivered).messages[0].text).toBe("Live croak");
    const moved = nextEvent(b, event => event.type === "motion" && event.frog.id === first.selfId && event.frog.x === 52.5);
    a.send(JSON.stringify({ type: "move", direction: 1, seq: 1 }));
    expect(await moved).toMatchObject({ frog: { facing: 1 } });
    const jumped = nextEvent(b, event => event.type === "motion" && event.frog.id === first.selfId && (event.frog.jumpedAt ?? 0) > 0);
    a.send(JSON.stringify({ type: "jump", seq: 2 }));
    const jumpEvent = await jumped;
    const jumpTime = jumpEvent.type === "motion" ? jumpEvent.frog.jumpedAt : undefined;
    expect(jumpTime).toBeGreaterThan(0);
    a.close();
    await once(a, "close");
    await speakInPond(second.token, "Croak during disconnect", "two");
    await publishPondChange();
    const recovered = await connect(first.token);
    const refreshed = nextSnapshot(recovered, snapshot => snapshot.messages.some(message => message.text === "Croak during disconnect"));
    recovered.send(JSON.stringify({ type: "heartbeat" }));
    const restored = await refreshed;
    expect(restored.messages).toHaveLength(2);
    expect(restored.frogs.find(frog => frog.id === first.selfId)).toMatchObject({ x: 52.5, jumpedAt: jumpTime });
    const departed = nextSnapshot(recovered, snapshot => snapshot.frogs.length === 1);
    await leavePond(second.token);
    await publishPondChange();
    expect((await departed).frogs[0].id).toBe(first.selfId);
  } finally {
    clients.forEach(client => client.terminate());
    server.clients.forEach(client => client.terminate());
    await new Promise<void>(resolve => server.close(() => resolve()));
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
}, 15_000);
