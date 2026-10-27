import type { PondId } from "./ponds";

export const MAX_MESSAGE_LENGTH = 180;
export const PRESENCE_MS = 90_000;
export const MESSAGE_LIFETIME_MS = 30 * 60_000;
export const BUBBLE_MS = 5_000;
export const JUMP_MS = 650;
export const MOVE_INTERVAL_MS = 150;
export const MOVE_STEP = 2.5;
export const MIN_POSITION = 6;
export const MAX_POSITION = 94;

export type Frog = {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  x?: number;
  facing?: -1 | 1;
  jumpedAt?: number;
  jumpId?: string;
  motionVersion?: number;
};

export type PondMessage = {
  id: string;
  frogId: string;
  name: string;
  color: string;
  text: string;
  sentAt: number;
  pending?: boolean;
};

export type PondSnapshot = {
  pond?: PondId;
  frogs: Frog[];
  messages: PondMessage[];
  serverTime: number;
};

export type PondSession = PondSnapshot & { token: string; selfId: string };

export const HEARTBEAT_MS = 25_000;
export type FrogAction = { type: "move"; direction: -1 | 1 } | { type: "jump"; jumpId?: string };
export type MotionEvent = { type: "motion"; frog: Frog; serverTime: number };
export type ActionResult = { pond: PondId; frog: Frog; accepted: boolean };
export type PondClientEvent = { type: "authenticate"; token: string } | { type: "heartbeat" } | (FrogAction & { seq: number });
export type PondServerEvent = { type: "snapshot"; snapshot: PondSnapshot } | MotionEvent | { type: "ack"; seq: number; frog: Frog; accepted: boolean; serverTime: number } | { type: "error"; status: number; message: string };
