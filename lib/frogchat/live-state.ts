import "server-only";

import { createHash } from "node:crypto";
import type Redis from "ioredis";
import { pondRedis, redisChannel } from "./redis";
import { JUMP_MS, MAX_POSITION, MIN_POSITION, MOVE_STEP, PRESENCE_MS, type Frog, type FrogAction } from "./types";
import { DEFAULT_POND, type PondId } from "./ponds";

export type Resident = Frog & {
  _id: string; pond?: PondId; expiresAt: number; lastSpokeAt: number; lastMovedAt?: number;
};

// A private hash holds residents, with a sorted expiry index for cleanup. Both
// keys share a cluster slot and expire when the entire room becomes inactive.
// Each action authenticates, checks limits, mutates and renews presence atomically.
const script = `
local residents, expiries = KEYS[1], KEYS[2]
local operation, now, ttl, key = ARGV[1], tonumber(ARGV[2]), tonumber(ARGV[3]), ARGV[4]
local function remove(id)
  redis.call('HDEL', residents, id)
  redis.call('ZREM', expiries, id)
end
local function save(frog)
  frog.expiresAt = now + ttl
  local value = cjson.encode(frog)
  redis.call('HSET', residents, key, value)
  redis.call('ZADD', expiries, frog.expiresAt, key)
  redis.call('PEXPIRE', residents, ttl)
  redis.call('PEXPIRE', expiries, ttl)
  return value
end
if operation == 'list' then
  for _, id in ipairs(redis.call('ZRANGEBYSCORE', expiries, '-inf', now)) do remove(id) end
  return redis.call('HVALS', residents)
end
if operation == 'join' then return {1, save(cjson.decode(ARGV[5]))} end
local value = redis.call('HGET', residents, key)
if not value then return {} end
local frog = cjson.decode(value)
if operation == 'leave' then remove(key) return {1, value} end
if frog.expiresAt <= now then remove(key) return {} end
local accepted = 1
if operation == 'move' then
  local receivedAt, direction = tonumber(ARGV[5]), tonumber(ARGV[6])
  if receivedAt - (frog.lastMovedAt or 0) < 100 then accepted = 0
  else
    frog.x = math.min(tonumber(ARGV[8]), math.max(tonumber(ARGV[7]), (frog.x or 50) + direction * tonumber(ARGV[9])))
    frog.facing, frog.lastMovedAt = direction, receivedAt
    frog.motionVersion = (frog.motionVersion or 0) + 1
  end
elseif operation == 'jump' then
  local receivedAt = tonumber(ARGV[5])
  if receivedAt - (frog.jumpedAt or 0) < tonumber(ARGV[7]) then accepted = 0
  else
    frog.jumpedAt, frog.jumpId = receivedAt, ARGV[6]
    frog.motionVersion = (frog.motionVersion or 0) + 1
  end
elseif operation == 'speak' then
  if now - frog.lastSpokeAt < 800 then accepted = 0 else frog.lastSpokeAt = now end
end
return {accepted, save(frog)}
`;

type StateRedis = Redis & { frogchatState(...args: (string | number)[]): Promise<unknown> };

async function command(operation: string, key = "", ...args: (string | number)[]) {
  const client = pondRedis() as StateRedis;
  if (!client.frogchatState) client.defineCommand("frogchatState", { numberOfKeys: 2, lua: script });
  // Derive the storage namespace from the same channel used for broadcasts, so
  // preview/production isolation applies to state as well as notifications.
  const namespace = createHash("sha256").update(redisChannel()).digest("hex");
  const prefix = `frogchat:{${namespace}}:live:v1`;
  return client.frogchatState(`${prefix}:residents`, `${prefix}:expiries`, operation, Date.now(), PRESENCE_MS, key, ...args);
}

async function mutate(operation: string, key: string, ...args: (string | number)[]) {
  const response = await command(operation, key, ...args) as [number, string] | [];
  return response.length ? { resident: JSON.parse(response[1]) as Resident, accepted: response[0] === 1 } : null;
}

export const addResident = (frog: Resident) => mutate("join", frog._id, JSON.stringify(frog));
export const renewResident = (key: string) => mutate("renew", key);
export const removeResident = (key: string) => mutate("leave", key);
export const claimSpeech = (key: string) => mutate("speak", key);
export const moveResident = (key: string, action: FrogAction, receivedAt: number) => action.type === "move"
  ? mutate("move", key, receivedAt, action.direction, MIN_POSITION, MAX_POSITION, MOVE_STEP)
  : mutate("jump", key, receivedAt, action.jumpId!, JUMP_MS);

export async function listResidents(pond: PondId): Promise<Resident[]> {
  const values = await command("list") as string[];
  return values.map(value => JSON.parse(value) as Resident).filter(frog => (frog.pond ?? DEFAULT_POND) === pond);
}
