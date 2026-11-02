import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { MongoClient, type Db } from "mongodb";
import { JUMP_MS, MAX_POSITION, MESSAGE_LIFETIME_MS, MIN_POSITION, MOVE_STEP, PRESENCE_MS, type ActionResult, type Frog, type FrogAction, type PondMessage, type PondSession, type PondSnapshot } from "./types";
import { addResident, claimSpeech, listResidents, moveResident, removeResident, renewResident, type Resident } from "./live-state";
import { redisUrl } from "./redis";
import { DEFAULT_POND, isPondId, POND_IDS, type PondId } from "./ponds";

type StoredMessage = PondMessage & { _id: string; pond?: PondId; expiresAt: Date };
type MemoryPond = { residents: Map<string, Resident>; messages: StoredMessage[] };

const shared = globalThis as typeof globalThis & {
  frogchatMemory?: MemoryPond;
  frogchatDatabase?: Promise<Db>;
};

export class PondError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const colors = ["#87b966", "#a4bce2", "#e6b178", "#b9a3d6", "#df9caa", "#83bcb0"];
const adjectives = ["Sunny", "Sleepy", "Little", "Happy", "Mellow", "Bouncy", "Cozy", "Lucky"];
const names = ["Moss", "Clover", "Pebble", "Willow", "Fern", "Reed", "Lotus", "Sprout"];

function tokenKey(token: string) { return createHash("sha256").update(token).digest("hex"); }
function publicFrog({ id, name, color, joinedAt, x, facing, jumpedAt, jumpId, motionVersion }: Resident): Frog {
  return { id, name, color, joinedAt, x: x ?? 50, facing: facing ?? 1, jumpedAt: jumpedAt ?? 0, jumpId, motionVersion: motionVersion ?? 0 };
}
function publicMessage({ id, frogId, name, color, text, sentAt }: StoredMessage): PondMessage {
  return { id, frogId, name, color, text, sentAt };
}

async function database(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) return null;
  if (!shared.frogchatDatabase) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    shared.frogchatDatabase = (async () => {
      try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || "ghg-master-api-v1");
        await Promise.all([
          db.collection("frogchat_messages").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          db.collection("frogchat_messages").createIndex({ sentAt: -1 }),
          db.collection("frogchat_messages").createIndex({ pond: 1, sentAt: -1 }),
        ]);
        return db;
      } catch (error) {
        shared.frogchatDatabase = undefined;
        await client.close().catch(() => undefined);
        throw error;
      }
    })();
  }
  return shared.frogchatDatabase;
}

function memory(now: number): MemoryPond {
  const pond = shared.frogchatMemory ??= { residents: new Map(), messages: [] };
  for (const [key, resident] of pond.residents) {
    if (resident.expiresAt <= now) pond.residents.delete(key);
  }
  pond.messages = POND_IDS.flatMap(id => pond.messages.filter(message => (message.pond ?? DEFAULT_POND) === id && message.expiresAt.getTime() > now).slice(-100));
  return pond;
}

function pondFilter(pond: PondId) {
  // Existing records belong to the original pond; no migration is required.
  return pond === DEFAULT_POND ? { $or: [{ pond }, { pond: { $exists: false } }] } : { pond };
}

async function residents(pond: PondId): Promise<Resident[]> {
  return redisUrl() ? listResidents(pond) : [...memory(Date.now()).residents.values()].filter(frog => (frog.pond ?? DEFAULT_POND) === pond);
}

async function snapshot(db: Db | null, pondId: PondId): Promise<PondSnapshot> {
  const serverTime = Date.now();
  const [frogs, messages] = await Promise.all([
    residents(pondId),
    db ? db.collection<StoredMessage>("frogchat_messages").find({ ...pondFilter(pondId), expiresAt: { $gt: new Date(serverTime) } }).sort({ sentAt: -1, _id: -1 }).limit(100).toArray().then(items => items.reverse())
      : Promise.resolve(memory(serverTime).messages.filter(message => (message.pond ?? DEFAULT_POND) === pondId)),
  ]);
  return {
    pond: pondId,
    frogs: frogs.sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).map(publicFrog),
    messages: messages.map(publicMessage), serverTime,
  };
}

function expiredSession(): never {
  throw new PondError("Your lily pad drifted away. Joining the pond again…", 401);
}

async function resident(token: string): Promise<Resident> {
  const key = tokenKey(token);
  if (redisUrl()) return (await renewResident(key))?.resident ?? expiredSession();
  const now = Date.now();
  const frog = memory(now).residents.get(key);
  if (!frog) return expiredSession();
  frog.expiresAt = now + PRESENCE_MS;
  return frog;
}

export async function joinPond(pond: PondId = DEFAULT_POND): Promise<PondSession> {
  if (!isPondId(pond)) throw new PondError("Choose an existing pond.", 400);
  const token = randomUUID();
  const id = randomUUID();
  const seed = parseInt(id.slice(0, 8), 16);
  const now = Date.now();
  const neighbors = await residents(pond);
  const x = [50, 38, 62, 26, 74, 14, 86, 6, 94].find(position => neighbors.every(frog => Math.abs((frog.x ?? 50) - position) >= 8)) ?? MIN_POSITION + seed % (MAX_POSITION - MIN_POSITION + 1);
  const frog: Resident = {
    _id: tokenKey(token), id, pond,
    name: `${adjectives[seed % adjectives.length]} ${names[Math.floor(seed / 8) % names.length]} ${id.slice(0, 3)}`,
    color: colors[seed % colors.length], joinedAt: now, x, facing: 1, jumpedAt: 0,
    expiresAt: now + PRESENCE_MS, lastSpokeAt: 0, motionVersion: 0,
  };
  if (redisUrl()) await addResident(frog);
  else memory(now).residents.set(frog._id, frog);
  return { ...await snapshot(await database(), pond), token, selfId: id };
}

// Redis authenticates, renews presence and applies motion in one round trip.
// No MongoDB connection or history reads occur on this path.
export async function actInPond(token: string, action: FrogAction, receivedAt = Date.now()): Promise<ActionResult> {
  if (action.type !== "jump" && (action.type !== "move" || (action.direction !== -1 && action.direction !== 1))) {
    throw new PondError("Choose a valid frog action.", 400);
  }
  const result = (value: Resident, accepted: boolean): ActionResult => ({ pond: value.pond ?? DEFAULT_POND, frog: publicFrog(value), accepted });
  if (redisUrl()) {
    const updated = await moveResident(tokenKey(token), action.type === "jump" ? { ...action, jumpId: action.jumpId ?? randomUUID() } : action, receivedAt);
    if (!updated) return expiredSession();
    return result(updated.resident, updated.accepted);
  }
  const frog = await resident(token);
  // Receipt times preserve input spacing when previous frames were queued.
  const now = receivedAt;
  if (action.type === "move") {
    if (now - (frog.lastMovedAt ?? 0) < 100) return result(frog, false);
    Object.assign(frog, { x: Math.min(MAX_POSITION, Math.max(MIN_POSITION, (frog.x ?? 50) + action.direction * MOVE_STEP)), facing: action.direction, lastMovedAt: now });
  } else {
    if (now - (frog.jumpedAt ?? 0) < JUMP_MS) return result(frog, false);
    Object.assign(frog, { jumpedAt: now, jumpId: action.jumpId ?? randomUUID() });
  }
  frog.motionVersion = (frog.motionVersion ?? 0) + 1;
  return result(frog, true);
}

export async function readPond(token: string): Promise<PondSnapshot> {
  const db = await database();
  const frog = await resident(token);
  return snapshot(db, frog.pond ?? DEFAULT_POND);
}

export async function speakInPond(token: string, text: string, requestId: string): Promise<PondSnapshot> {
  const db = await database();
  const frog = await resident(token);
  const pond = frog.pond ?? DEFAULT_POND;
  const messageId = `${frog.id}:${requestId}`;
  const now = Date.now();
  // Check retries before claiming the shared per-resident speech cooldown.
  if (db) {
    if (await db.collection<StoredMessage>("frogchat_messages").findOne({ _id: messageId })) return snapshot(db, pond);
  } else if (memory(now).messages.some(message => message.id === messageId)) return snapshot(db, pond);
  if (redisUrl()) {
    const claimed = await claimSpeech(frog._id);
    if (!claimed) return expiredSession();
    if (!claimed.accepted) throw new PondError("Take a tiny breath between croaks.", 429);
  } else {
    if (now - frog.lastSpokeAt < 800) throw new PondError("Take a tiny breath between croaks.", 429);
    frog.lastSpokeAt = now;
  }
  const message: StoredMessage = {
    _id: messageId, id: messageId, pond, frogId: frog.id, name: frog.name, color: frog.color,
    text, sentAt: now, expiresAt: new Date(now + MESSAGE_LIFETIME_MS),
  };
  if (db) await db.collection<StoredMessage>("frogchat_messages").insertOne(message);
  else memory(now).messages.push(message);
  return snapshot(db, pond);
}

export async function leavePond(token: string): Promise<PondId> {
  const key = tokenKey(token);
  if (redisUrl()) return (await removeResident(key))?.resident.pond ?? DEFAULT_POND;
  const pond = memory(Date.now());
  const frog = pond.residents.get(key);
  pond.residents.delete(key);
  return frog?.pond ?? DEFAULT_POND;
}
