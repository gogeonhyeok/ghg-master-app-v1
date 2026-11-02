import "server-only";

import type Redis from "ioredis";
import { createPondRedis, pondRedis, redisChannel as channel, redisUrl } from "./redis";
import { DEFAULT_POND, isPondId, type PondId } from "./ponds";
import { isMotionFrog } from "./motion";
import type { Frog, MotionEvent } from "./types";

type Listener = { changed: (motion?: MotionEvent) => void; disconnected: () => void; pond: PondId };
type Hub = { listeners: Set<Listener>; subscriber?: Redis; ready?: Promise<void> };
const shared = globalThis as typeof globalThis & { frogchatHub?: Hub };
const hub = () => shared.frogchatHub ??= { listeners: new Set() };

export function requireRealtimeConfiguration() {
  if (process.env.VERCEL && (!redisUrl() || !(process.env.MONGODB_URI || process.env.MONGODB_URL))) {
    throw new Error("Frogchat on Vercel requires MongoDB and a Redis TCP URL.");
  }
}

// One subscriber per instance; only public deltas/invalidations, never tokens.
export async function subscribePondChanges(changed: Listener["changed"], disconnected: () => void, pond: PondId = DEFAULT_POND) {
  requireRealtimeConfiguration();
  const state = hub();
  const listener = { changed, disconnected, pond };
  state.listeners.add(listener);
  function remove() {
    state.listeners.delete(listener);
    if (!state.listeners.size) {
      const subscriber = state.subscriber;
      state.subscriber = undefined;
      state.ready = undefined;
      subscriber?.disconnect();
    }
  }
  try {
    if (redisUrl() && !state.subscriber) {
      const subscriber = createPondRedis();
      state.subscriber = subscriber;
      const failed = () => {
        if (state.subscriber === subscriber) {
          for (const item of [...state.listeners]) item.disconnected();
        }
      };
      subscriber.on("error", failed);
      subscriber.on("end", failed);
      subscriber.on("message", (topic, message) => {
        if (topic !== channel()) return;
        if (message.startsWith("{")) {
          try {
            const event = JSON.parse(message);
            if (event.type === "motion" && isPondId(event.pond) && isMotionFrog(event.frog) && Number.isFinite(event.serverTime)) {
              const motion: MotionEvent = { type: "motion", frog: event.frog, serverTime: event.serverTime };
              for (const item of [...state.listeners]) if (item.pond === event.pond) item.changed(motion);
            }
          } catch { /* Ignore malformed messages from other channel publishers. */ }
          return;
        }
        const changedPond = message === "changed" ? DEFAULT_POND : message;
        if (topic === channel() && isPondId(changedPond)) {
          for (const item of [...state.listeners]) if (item.pond === changedPond) item.changed();
        }
      });
      state.ready = (async () => {
        await subscriber.connect();
        await subscriber.subscribe(channel());
      })();
    }
    await state.ready;
    return remove;
  } catch (error) {
    remove();
    throw error;
  }
}

async function publish(pond: PondId, motion?: MotionEvent) {
  requireRealtimeConfiguration();
  const state = hub();
  if (!redisUrl()) {
    for (const listener of [...state.listeners]) if (listener.pond === pond) listener.changed(motion);
    return;
  }
  // ioredis automatically connects a lazy client on its first command.
  await pondRedis().publish(channel(), motion ? JSON.stringify({ ...motion, pond }) : pond === DEFAULT_POND ? "changed" : pond);
}

export const publishPondChange = (pond: PondId = DEFAULT_POND) => publish(pond);
export const publishPondMotion = (pond: PondId, frog: Frog) => publish(pond, { type: "motion", frog, serverTime: Date.now() });
