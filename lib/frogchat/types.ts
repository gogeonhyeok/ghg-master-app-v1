export const MAX_MESSAGE_LENGTH = 180;
export const PRESENCE_MS = 90_000;
export const MESSAGE_LIFETIME_MS = 30 * 60_000;
export const BUBBLE_MS = 10_000;

export type Frog = {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
};

export type PondMessage = {
  id: string;
  frogId: string;
  name: string;
  color: string;
  text: string;
  sentAt: number;
};

export type PondSnapshot = {
  frogs: Frog[];
  messages: PondMessage[];
  serverTime: number;
};

export type PondSession = PondSnapshot & { token: string; selfId: string };
