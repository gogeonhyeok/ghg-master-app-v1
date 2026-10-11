import nextEnv from "@next/env";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "node:url";
import { isValidPhotoDataUrl } from "./inventory-validation.ts";
import { migrateInventoryPhotos } from "./photo-migration.ts";

// Node.js 22.18+ supports these TypeScript imports without an extra dependency.
nextEnv.loadEnvConfig(fileURLToPath(new URL("../../", import.meta.url)));
const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!uri) throw new Error("MongoDB server configuration is missing.");

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
try {
  await client.connect();
  const collection = client.db("ghg-master-api-v1").collection("inventories");
  const summary = await migrateInventoryPhotos(collection, (photo) => {
    if (!isValidPhotoDataUrl(photo)) return null;
    return {
      bytes: Buffer.from(photo.slice(photo.indexOf(",") + 1), "base64"),
      contentType: photo.slice(5, photo.indexOf(";")),
    };
  }, apply);
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...summary }));
} catch {
  console.error("Photo migration failed. Check MongoDB configuration and connectivity; rerunning is safe.");
  process.exitCode = 1;
} finally {
  await client.close();
}
