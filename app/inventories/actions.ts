"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { getInventoriesDatabase, INVENTORIES_COLLECTION } from "./data";
import { isValidPhotoFile } from "./inventory-validation";
import type { CreateInventoryState } from "./types";

const PHOTO_API_URL = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/photos";

export async function createInventory(
  _previousState: CreateInventoryState,
  formData: FormData,
): Promise<CreateInventoryState> {
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const rawPhoto = formData.get("photo");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";

  if (!name || name.length > 120) {
    return { status: "error", message: "Enter a name of up to 120 characters." };
  }
  if (!description || description.length > 2000) {
    return { status: "error", message: "Enter a description of up to 2,000 characters." };
  }
  if (rawPhoto !== null && (!(rawPhoto instanceof File) || !isValidPhotoFile(rawPhoto))) {
    return { status: "error", message: "Choose a JPEG, PNG, WebP, or GIF image no larger than 2 MB after compression." };
  }

  try {
    const database = await getInventoriesDatabase();
    const id = new ObjectId();
    let photo: string | null = null;
    if (rawPhoto instanceof File) {
      photo = `${PHOTO_API_URL}/${id.toHexString()}`;
      const response = await fetch(photo, {
        method: "PUT",
        headers: { "Content-Type": rawPhoto.type },
        body: await rawPhoto.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        return { status: "error", message: "The photo could not be uploaded. Your details are still in the form. Please try again." };
      }
    }
    const now = new Date();
    await database.collection(INVENTORIES_COLLECTION).insertOne({
      _id: id,
      name,
      description,
      createdDate: now,
      updatedDate: now,
      photo,
      photoContentType: rawPhoto instanceof File ? rawPhoto.type : null,
    });
  } catch {
    return { status: "error", message: "The inventory could not be saved. Your details are still in the form." };
  }

  revalidatePath("/inventories");
  return { status: "success", message: "Inventory added." };
}
