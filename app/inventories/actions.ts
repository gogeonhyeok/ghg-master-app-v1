"use server";

import { revalidatePath } from "next/cache";
import { getInventoriesDatabase, INVENTORIES_COLLECTION } from "./data";
import { isValidPhotoDataUrl } from "./inventory-validation";
import type { CreateInventoryState } from "./types";

export async function createInventory(
  _previousState: CreateInventoryState,
  formData: FormData,
): Promise<CreateInventoryState> {
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const rawPhoto = formData.get("photo");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const photo = typeof rawPhoto === "string" ? rawPhoto : "";

  if (!name || name.length > 120) {
    return { status: "error", message: "Enter a name of up to 120 characters." };
  }
  if (!description || description.length > 2000) {
    return { status: "error", message: "Enter a description of up to 2,000 characters." };
  }
  if (photo && !isValidPhotoDataUrl(photo)) {
    return { status: "error", message: "Choose a JPEG, PNG, WebP, or GIF image no larger than 512 KB." };
  }

  try {
    const database = await getInventoriesDatabase();
    const now = new Date();
    await database.collection(INVENTORIES_COLLECTION).insertOne({
      name,
      description,
      createdDate: now,
      updatedDate: now,
      photo,
    });
  } catch {
    return { status: "error", message: "The inventory could not be saved. Your details are still in the form." };
  }

  revalidatePath("/inventories");
  return { status: "success", message: "Inventory added." };
}
