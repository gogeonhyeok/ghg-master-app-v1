import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { MongoClient, type Db } from "mongodb";
import { MESSAGE_LIFETIME_MS, PRESENCE_MS, type Frog, type PondMessage, type PondSession, type PondSnapshot } from "./types";

type Resident = Frog & { _id: string; expiresAt: Date; lastSpokeAt: Date };
type StoredMessage = PondMessage & { _id: string; expiresAt: Date };
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
function publicFrog({ id, name, color, joinedAt }: Resident): Frog { return { id, name, color, joinedAt }; }
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
    if (resident.expiresAt.getTime() <= now) pond.residents.delete(key);
  }
  pond.messages = pond.messages.filter(message => message.expiresAt.getTime() > now).slice(-100);
  return pond;
}

async function snapshot(db: Db | null): Promise<PondSnapshot> {
  const serverTime = Date.now();
  if (db) {
    const [residents, messages] = await Promise.all([
      db.collection<Resident>("frogchat_residents").find({ expiresAt: { $gt: new Date(serverTime) } }).sort({ joinedAt: 1, id: 1 }).toArray(),
      db.collection<StoredMessage>("frogchat_messages").find({ expiresAt: { $gt: new Date(serverTime) } }).sort({ sentAt: -1, _id: -1 }).limit(100).toArray(),
    ]);
    return { frogs: residents.map(publicFrog), messages: messages.reverse().map(publicMessage), serverTime };
  }
  const pond = memory(serverTime);
  return {
    frogs: [...pond.residents.values()].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id)).map(publicFrog),
    messages: pond.messages.map(publicMessage), serverTime,
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

export async function joinPond(): Promise<PondSession> {
  const db = await database();
  const token = randomUUID();
  const id = randomUUID();
  const seed = parseInt(id.slice(0, 8), 16);
  const now = Date.now();
  const frog: Resident = {
    _id: tokenKey(token), id,
    name: `${adjectives[seed % adjectives.length]} ${names[Math.floor(seed / 8) % names.length]} ${id.slice(0, 3)}`,
    color: colors[seed % colors.length], joinedAt: now,
    expiresAt: new Date(now + PRESENCE_MS), lastSpokeAt: new Date(0),
  };
  if (db) await db.collection<Resident>("frogchat_residents").insertOne(frog);
  else memory(now).residents.set(frog._id, frog);
  return { ...await snapshot(db), token, selfId: id };
}

export async function readPond(token: string): Promise<PondSnapshot> {
  const db = await database();
  await resident(db, token);
  return snapshot(db);
}

export async function speakInPond(token: string, text: string, requestId: string): Promise<PondSnapshot> {
  const db = await database();
  const frog = await resident(db, token);
  const messageId = `${frog.id}:${requestId}`;
  const now = Date.now();
  if (db) {
    // Retried requests return the original message, without another croak.
    if (await db.collection<StoredMessage>("frogchat_messages").findOne({ _id: messageId })) return snapshot(db);
    const claimed = await db.collection<Resident>("frogchat_residents").findOneAndUpdate(
      { _id: frog._id, lastSpokeAt: { $lte: new Date(now - 800) } },
      { $set: { lastSpokeAt: new Date(now) } },
    );
    if (!claimed.value) throw new PondError("Take a tiny breath between croaks.", 429);
  } else {
    const pond = memory(now);
    if (pond.messages.some(message => message.id === messageId)) return snapshot(db);
    if (now - frog.lastSpokeAt.getTime() < 800) throw new PondError("Take a tiny breath between croaks.", 429);
    frog.lastSpokeAt = new Date(now);
  }
  const message: StoredMessage = {
    _id: messageId, id: messageId, frogId: frog.id, name: frog.name, color: frog.color,
    text, sentAt: now, expiresAt: new Date(now + MESSAGE_LIFETIME_MS),
  };
  if (db) await db.collection<StoredMessage>("frogchat_messages").insertOne(message);
  else memory(now).messages.push(message);
  return snapshot(db);
}

export async function leavePond(token: string): Promise<void> {
  const db = await database();
  if (db) await db.collection<Resident>("frogchat_residents").deleteOne({ _id: tokenKey(token) });
  else memory(Date.now()).residents.delete(tokenKey(token));
}
