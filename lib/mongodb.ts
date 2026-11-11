import "server-only";
import { MongoClient } from "mongodb";

const shared = globalThis as typeof globalThis & { appMongoClient?: Promise<MongoClient> };

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!uri) throw new Error("MongoDB server configuration is missing.");
  if (!shared.appMongoClient) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    shared.appMongoClient = client.connect().catch(async () => {
      shared.appMongoClient = undefined;
      await client.close().catch(() => undefined);
      throw new Error("MongoDB connection unavailable.");
    });
  }
  return shared.appMongoClient;
}

export default getMongoClient;
