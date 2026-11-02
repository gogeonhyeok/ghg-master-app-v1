import { MOVE_INTERVAL_MS, type Frog } from "./types";
import { newerFrog } from "./motion";

export const REMOTE_BUFFER_MS = 180;
export const MAX_MOTION_SAMPLES = 12;
export type TimedFrog = Frog & { sampledAt?: number };

// Preserve the timestamp of unchanged motion across chat/heartbeat snapshots.
export function timeFrog(previous: TimedFrog | undefined, incoming: Frog, at: number): TimedFrog {
  const selected = newerFrog(previous, incoming);
  if (selected === previous) return previous!;
  const unchanged = previous && previous.x === incoming.x && previous.facing === incoming.facing
    && previous.jumpedAt === incoming.jumpedAt && previous.jumpId === incoming.jumpId
    && previous.motionVersion === incoming.motionVersion;
  if (unchanged && previous.name === incoming.name && previous.color === incoming.color && previous.joinedAt === incoming.joinedAt) return previous;
  return { ...incoming, sampledAt: unchanged ? previous.sampledAt : at };
}

type Sample = { x: number; at: number };

// Browser-only presentation cache. It never changes authoritative game state.
export class PositionTimeline {
  private samples: Sample[];
  private tween: { from: number; to: number; at: number };

  constructor(x: number, private remote: boolean, at: number) {
    this.samples = [{ x, at }];
    this.tween = { from: x, to: x, at };
  }

  reset(x: number, at: number) {
    this.samples = [{ x, at }];
    this.tween = { from: x, to: x, at };
  }

  push(x: number, sampledAt: number, receivedAt: number) {
    if (!this.remote) {
      if (this.tween.to !== x) this.tween = { from: this.read(receivedAt).x, to: x, at: receivedAt };
      return;
    }
    const last = this.samples.at(-1)!;
    if (sampledAt < last.at) return;
    // Snap teleports/recovery rather than sliding across the entire room.
    if (Math.abs(x - last.x) > 20) { this.reset(x, sampledAt); return; }
    if (sampledAt === last.at) { last.x = x; return; }
    if (last.x === x) return;
    // After standing still, start from a recent stationary sample. A position
    // received minutes later must not interpolate over the entire idle period.
    if (sampledAt - last.at > MOVE_INTERVAL_MS * 2) {
      this.samples = [{ x: last.x, at: sampledAt - MOVE_INTERVAL_MS }];
    }
    this.samples.push({ x, at: sampledAt });
    if (this.samples.length > MAX_MOTION_SAMPLES) this.samples.splice(0, this.samples.length - MAX_MOTION_SAMPLES);
  }

  read(at: number): { x: number; active: boolean } {
    if (!this.remote) {
      const fraction = Math.min(1, Math.max(0, (at - this.tween.at) / MOVE_INTERVAL_MS));
      return { x: this.tween.from + (this.tween.to - this.tween.from) * fraction, active: fraction < 1 && this.tween.from !== this.tween.to };
    }
    const time = at - REMOTE_BUFFER_MS;
    const first = this.samples[0];
    const last = this.samples.at(-1)!;
    if (time >= last.at || this.samples.length === 1) return { x: last.x, active: false };
    if (time <= first.at) return { x: first.x, active: true };
    for (let index = 1; index < this.samples.length; index++) {
      const next = this.samples[index];
      if (next.at >= time) {
        const previous = this.samples[index - 1];
        const fraction = (time - previous.at) / (next.at - previous.at);
        return { x: previous.x + (next.x - previous.x) * fraction, active: true };
      }
    }
    return { x: last.x, active: false };
  }

  get size() { return this.samples.length; }
}
