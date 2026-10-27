import { MAX_POSITION, MIN_POSITION, MOVE_STEP, type Frog, type FrogAction } from "./types";

export type PendingAction = { seq: number; action: FrogAction; at: number };

// Shared movement rules; the server still validates rate, ownership, and bounds.
export function predictFrog(frog: Frog, action: FrogAction, at: number): Frog {
  return action.type === "move"
    ? { ...frog, x: Math.min(MAX_POSITION, Math.max(MIN_POSITION, (frog.x ?? 50) + action.direction * MOVE_STEP)), facing: action.direction }
    : { ...frog, jumpedAt: at, jumpId: action.jumpId };
}

export function replayActions(frog: Frog, actions: PendingAction[]): Frog {
  return actions.reduce((current, pending) => predictFrog(current, pending.action, pending.at), frog);
}

export function newerFrog(current: Frog | undefined, incoming: Frog): Frog {
  return current && (current.motionVersion ?? 0) > (incoming.motionVersion ?? 0) ? current : incoming;
}

export function isMotionFrog(value: unknown): value is Frog {
  if (!value || typeof value !== "object") return false;
  const frog = value as Frog;
  return typeof frog.id === "string" && typeof frog.name === "string" && typeof frog.color === "string"
    && Number.isFinite(frog.joinedAt) && Number.isFinite(frog.x) && frog.x! >= MIN_POSITION && frog.x! <= MAX_POSITION
    && (frog.facing === -1 || frog.facing === 1) && Number.isFinite(frog.jumpedAt)
    && Number.isSafeInteger(frog.motionVersion) && frog.motionVersion! >= 0
    && (frog.jumpId === undefined || (typeof frog.jumpId === "string" && frog.jumpId.length <= 64));
}
