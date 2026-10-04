import "server-only";

import { MongoClient, type Db } from "mongodb";
import { isValidPhotoDataUrl } from "./inventory-validation";
import type { Inventory } from "./types";

export const INVENTORIES_DATABASE = "ghg-master-api-v1";
export const INVENTORIES_COLLECTION = "inventories";

const mongoGlobal = globalThis as typeof globalThis & {
  inventoriesMongo?: Promise<MongoClient>;
};

type InventoryDocument = {
  name?: unknown;
  description?: unknown;
  createdDate?: unknown;
  updatedDate?: unknown;
  photo?: unknown;
};

function toIsoDate(value: unknown): string {
  const date = value instanceof Date
    ? value
    : typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : null;

  return date && Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

export async function getInventoriesDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) throw new Error("MongoDB server configuration is missing.");

  if (!mongoGlobal.inventoriesMongo) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    mongoGlobal.inventoriesMongo = client.connect().catch(async () => {
      mongoGlobal.inventoriesMongo = undefined;
      await client.close().catch(() => undefined);
      throw new Error("Inventory database connection unavailable.");
    });
  }

  return (await mongoGlobal.inventoriesMongo).db(INVENTORIES_DATABASE);
}

export async function getInventories(): Promise<Inventory[]> {
  const database = await getInventoriesDatabase();
  const documents = await database
    .collection<InventoryDocument>(INVENTORIES_COLLECTION)
    .find({}, {
      projection: { name: 1, description: 1, createdDate: 1, updatedDate: 1, photo: 1 },
    })
    .sort({ updatedDate: -1, _id: -1 })
    .limit(100)
    .maxTimeMS(5000)
    .toArray();

  return documents.map((document) => {
    const photo = typeof document.photo === "string" && isValidPhotoDataUrl(document.photo)
      ? document.photo
      : "";

    return {
      id: String(document._id),
      name: typeof document.name === "string" && document.name.trim() ? document.name : "Unnamed inventory",
      description: typeof document.description === "string" ? document.description : "",
      createdDate: toIsoDate(document.createdDate),
      updatedDate: toIsoDate(document.updatedDate),
      photo,
    };
  });
}
