import "server-only";

import Redis from "ioredis";

const shared = globalThis as typeof globalThis & { frogchatRedis?: Redis };
export const redisUrl = () => process.env.FROGCHAT_REDIS_URL || process.env.REDIS_URL;
export const redisChannel = () => process.env.FROGCHAT_REDIS_CHANNEL || `frogchat:${process.env.VERCEL_ENV || "development"}`;

export function createPondRedis() {
  return new Redis(redisUrl()!, {
    lazyConnect: true, connectTimeout: 5000, maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
}

// Commands and publishing share one connection; Pub/Sub needs its own subscriber.
export function pondRedis(): Redis {
  if (!shared.frogchatRedis || shared.frogchatRedis.status === "end") {
    shared.frogchatRedis = createPondRedis();
    // Callers report failures without logging credentials from connection errors.
    shared.frogchatRedis.on("error", () => undefined);
  }
  return shared.frogchatRedis;
}
