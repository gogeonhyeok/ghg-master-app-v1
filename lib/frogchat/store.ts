import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { MongoClient, type Db } from "mongodb";
import { JUMP_MS, MAX_POSITION, MESSAGE_LIFETIME_MS, MIN_POSITION, MOVE_STEP, PRESENCE_MS, type Frog, type FrogAction, type PondMessage, type PondSession, type PondSnapshot } from "./types";
import { DEFAULT_POND, isPondId, POND_IDS, type PondId } from "./ponds";

type Resident = Frog & { _id: string; pond?: PondId; expiresAt: Date; lastSpokeAt: Date; lastMovedAt?: Date };
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
function publicFrog({ id, name, color, joinedAt, x, facing, jumpedAt }: Resident): Frog {
  return { id, name, color, joinedAt, x: x ?? 50, facing: facing ?? 1, jumpedAt: jumpedAt ?? 0 };
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
          db.collection("frogchat_residents").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          db.collection("frogchat_messages").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
          db.collection("frogchat_messages").createIndex({ sentAt: -1 }),
          db.collection("frogchat_residents").createIndex({ pond: 1, expiresAt: 1 }),
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
  const pond: MemoryPond = shared.frogchatMemory ??= { residents: new Map(), messages: [] };
  for (const [key, resident] of pond.residents) {
    if (resident.expiresAt.getTime() <= now) pond.residents.delete(key);
  }
  pond.messages = POND_IDS.flatMap(id => pond.messages.filter(message => (message.pond ?? DEFAULT_POND) === id && message.expiresAt.getTime() > now).slice(-100));
  return pond;
}

function pondFilter(pond: PondId) {
  // Existing records belong to the original pond; no migration is required.
  return pond === DEFAULT_POND ? { $or: [{ pond }, { pond: { $exists: false } }] } : { pond };
}

async function snapshot(db: Db | null, pondId: PondId): Promise<PondSnapshot> {
  const serverTime = Date.now();
  if (db) {
    const [residents, messages] = await Promise.all([
      db.collection<Resident>("frogchat_residents").find({ ...pondFilter(pondId), expiresAt: { $gt: new Date(serverTime) } }).sort({ joinedAt: 1, id: 1 }).toArray(),
      db.collection<StoredMessage>("frogchat_messages").find({ ...pondFilter(pondId), expiresAt: { $gt: new Date(serverTime) } }).sort({ sentAt: -1, _id: -1 }).limit(100).toArray(),
    ]);
    return { pond: pondId, frogs: residents.map(publicFrog), messages: messages.reverse().map(publicMessage), serverTime };
  }
  const pond = memory(serverTime);
  return {
    pond: pondId,
    frogs: [...pond.residents.values()].filter(frog => (frog.pond ?? DEFAULT_POND) === pondId).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).map(publicFrog),
    messages: pond.messages.filter(message => (message.pond ?? DEFAULT_POND) === pondId).map(publicMessage), serverTime,
  };
}

async function resident(db: Db | null, token: string): Promise<Resident> {
  const now = Date.now();
  const key = tokenKey(token);
  const expiresAt = new Date(now + PRESENCE_MS);
  const frog = db
    ? (await db.collection<Resident>("frogchat_residents").findOneAndUpdate(
      { _id: key, expiresAt: { $gt: new Date(now) } }, { $set: { expiresAt } }, { returnDocument: "after" },
    )).value
    : memory(now).residents.get(key);
  if (!frog) throw new PondError("Your lily pad drifted away. Joining the pond again…", 401);
  if (!db) frog.expiresAt = expiresAt;
  return frog;
}

export async function joinPond(pond: PondId = DEFAULT_POND): Promise<PondSession> {
  if (!isPondId(pond)) throw new PondError("Choose an existing pond.", 400);
  const db = await database();
  const token = randomUUID();
  const id = randomUUID();
  const seed = parseInt(id.slice(0, 8), 16);
  const now = Date.now();
  const neighbors = db
    ? await db.collection<Resident>("frogchat_residents").find({ ...pondFilter(pond), expiresAt: { $gt: new Date(now) } }).project<{ x?: number }>({ x: 1 }).toArray()
    : [...memory(now).residents.values()].filter(frog => (frog.pond ?? DEFAULT_POND) === pond);
  const x = [50, 38, 62, 26, 74, 14, 86, 6, 94].find(position => neighbors.every(frog => Math.abs((frog.x ?? 50) - position) >= 8)) ?? MIN_POSITION + seed % (MAX_POSITION - MIN_POSITION + 1);
  const frog: Resident = {
    _id: tokenKey(token), id, pond,
    name: `${adjectives[seed % adjectives.length]} ${names[Math.floor(seed / 8) % names.length]} ${id.slice(0, 3)}`,
    color: colors[seed % colors.length], joinedAt: now, x, facing: 1, jumpedAt: 0,
    expiresAt: new Date(now + PRESENCE_MS), lastSpokeAt: new Date(0),
  };
  if (db) await db.collection<Resident>("frogchat_residents").insertOne(frog);
  else memory(now).residents.set(frog._id, frog);
  return { ...await snapshot(db, pond), token, selfId: id };
}

// Actions only affect the authenticated resident. Both storage paths enforce
// bounds and cooldowns, including concurrent sockets using the same token.
export async function actInPond(token: string, action: FrogAction): Promise<PondId | null> {
  if (action.type !== "jump" && (action.type !== "move" || (action.direction !== -1 && action.direction !== 1))) {
    throw new PondError("Choose a valid frog action.", 400);
  }
  const db = await database();
  const frog = await resident(db, token);
  const now = Date.now();
  if (action.type === "move") {
    if (now - (frog.lastMovedAt?.getTime() ?? 0) < 100) return null;
    const fields = { x: Math.min(MAX_POSITION, Math.max(MIN_POSITION, (frog.x ?? 50) + action.direction * MOVE_STEP)), facing: action.direction, lastMovedAt: new Date(now) };
    if (db) {
      const claimed = await db.collection<Resident>("frogchat_residents").findOneAndUpdate(
        { _id: frog._id, $or: [{ lastMovedAt: { $exists: false } }, { lastMovedAt: { $lte: new Date(now - 100) } }] }, { $set: fields },
      );
      if (!claimed.value) return null;
    } else Object.assign(frog, fields);
  } else {
    if (now - (frog.jumpedAt ?? 0) < JUMP_MS) return null;
    if (db) {
      const claimed = await db.collection<Resident>("frogchat_residents").findOneAndUpdate(
        { _id: frog._id, $or: [{ jumpedAt: { $exists: false } }, { jumpedAt: { $lte: now - JUMP_MS } }] }, { $set: { jumpedAt: now } },
      );
      if (!claimed.value) return null;
    } else frog.jumpedAt = now;
  }
  return frog.pond ?? DEFAULT_POND;
}

export async function readPond(token: string): Promise<PondSnapshot> {
  const db = await database();
  const frog = await resident(db, token);
  return snapshot(db, frog.pond ?? DEFAULT_POND);
}

export async function speakInPond(token: string, text: string, requestId: string): Promise<PondSnapshot> {
  const db = await database();
  const frog = await resident(db, token);
  const pond = frog.pond ?? DEFAULT_POND;
  const messageId = `${frog.id}:${requestId}`;
  const now = Date.now();
  if (db) {
    // Retried requests return the original message, without another croak.
    if (await db.collection<StoredMessage>("frogchat_messages").findOne({ _id: messageId })) return snapshot(db, pond);
    const claimed = await db.collection<Resident>("frogchat_residents").findOneAndUpdate(
      { _id: frog._id, lastSpokeAt: { $lte: new Date(now - 800) } },
      { $set: { lastSpokeAt: new Date(now) } },
    );
    if (!claimed.value) throw new PondError("Take a tiny breath between croaks.", 429);
  } else {
    const memoryPond = memory(now);
    if (memoryPond.messages.some(message => message.id === messageId)) return snapshot(db, pond);
    if (now - frog.lastSpokeAt.getTime() < 800) throw new PondError("Take a tiny breath between croaks.", 429);
    frog.lastSpokeAt = new Date(now);
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
  const db = await database();
  const key = tokenKey(token);
  if (db) {
    const { value: frog } = await db.collection<Resident>("frogchat_residents").findOneAndDelete({ _id: key });
    return frog?.pond ?? DEFAULT_POND;
  }
  const pond = memory(Date.now());
  const frog = pond.residents.get(key);
  pond.residents.delete(key);
  return frog?.pond ?? DEFAULT_POND;
}
