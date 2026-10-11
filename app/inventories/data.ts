import "server-only";

import { Binary, MongoClient, ObjectId, type Db } from "mongodb";
import { isValidPhotoDataUrl, isValidPhotoFile } from "./inventory-validation";
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
  photoContentType?: unknown;
  hasPhoto?: boolean;
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
      // Compute a flag in MongoDB so neither binary nor legacy Base64 bytes travel with the list.
      projection: {
        name: 1, description: 1, createdDate: 1, updatedDate: 1,
        hasPhoto: { $and: [
          { $in: [{ $type: "$photo" }, ["binData", "string"]] },
          { $ne: ["$photo", ""] },
        ] },
      },
    })
    .sort({ updatedDate: -1, _id: -1 })
    .limit(100)
    .maxTimeMS(5000)
    .toArray();

  return documents.map((document) => {
    const photo = document.hasPhoto
      ? `/inventories/${encodeURIComponent(String(document._id))}/photo`
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

export async function getInventoryPhoto(id: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;

  const database = await getInventoriesDatabase();
  const document = await database.collection<InventoryDocument>(INVENTORIES_COLLECTION).findOne(
    { _id: new ObjectId(id) },
    { projection: { photo: 1, photoContentType: 1 }, maxTimeMS: 5000 },
  );
  if (!document) return null;

  if (document.photo instanceof Binary && typeof document.photoContentType === "string") {
    const bytes = new Uint8Array(document.photo.read(0, document.photo.length()));
    return isValidPhotoFile({ type: document.photoContentType, size: bytes.byteLength })
      ? { bytes, contentType: document.photoContentType }
      : null;
  }

  // Keep old records readable until their Base64 values have been migrated.
  if (typeof document.photo === "string" && isValidPhotoDataUrl(document.photo)) {
    const separator = document.photo.indexOf(",");
    const bytes = new Uint8Array(Buffer.from(document.photo.slice(separator + 1), "base64"));
    return bytes.byteLength > 0
      ? { bytes, contentType: document.photo.slice(5, document.photo.indexOf(";")) }
      : null;
  }
  return null;
}
