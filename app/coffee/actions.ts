"use server";

import { MongoClient } from "mongodb";

const mongoGlobal = globalThis as typeof globalThis & { coffeeMongo?: Promise<MongoClient> };

export async function placeOrder(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const name = formData.get("customerName");
  const rawQuantity = formData.get("quantity");
  const quantity = typeof rawQuantity === "string" ? Number(rawQuantity) : NaN;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80 ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { ok: false, message: "Enter your name (up to 80 characters) and a quantity from 1 to 10." };
  }

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
    if (!uri) throw new Error("Missing MongoDB configuration");
    if (!mongoGlobal.coffeeMongo) {
      const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
      mongoGlobal.coffeeMongo = client.connect().catch(async () => {
        mongoGlobal.coffeeMongo = undefined;
        await client.close().catch(() => undefined);
        throw new Error("Coffee database unavailable");
      });
    }
    const client = await mongoGlobal.coffeeMongo;
    const result = await client.db("ghg-master-api-v1").collection("order").insertOne({
      customerName: name.trim(),
      items: [{ name: "Americano", quantity }],
      status: "pending",
      source: "coffee",
      createdAt: new Date(),
    });
    return { ok: true, message: `Order received! Your reference is ${result.insertedId.toString()}.` };
  } catch {
    return { ok: false, message: "We couldn’t confirm your order. Please check with the host before trying again." };
  }
}
