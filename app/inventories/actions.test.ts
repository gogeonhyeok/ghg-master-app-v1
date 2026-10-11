/** @jest-environment node */
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("./data", () => ({
  getInventoriesDatabase: jest.fn(),
  INVENTORIES_COLLECTION: "inventories",
}));

import { revalidatePath } from "next/cache";
import { Binary, BSON } from "mongodb";
import { createInventory } from "./actions";
import { getInventoriesDatabase } from "./data";
import { initialCreateInventoryState } from "./types";
import { MAX_PHOTO_BYTES } from "./inventory-validation";

const insertOne = jest.fn();
const collection = jest.fn(() => ({ insertOne }));

function inventoryForm(overrides: Record<string, string | File> = {}) {
  const formData = new FormData();
  formData.set("name", overrides.name ?? " Studio camera ");
  formData.set("description", overrides.description ?? " Main production camera ");
  formData.set("photo", overrides.photo ?? new File([new Uint8Array([0, 128, 255, 10])], "camera.png", { type: "image/png" }));
  return formData;
}

beforeEach(() => {
  jest.clearAllMocks();
  insertOne.mockResolvedValue({ acknowledged: true });
  jest.mocked(getInventoriesDatabase).mockResolvedValue({ collection } as never);
});

test("creates a document with the requested schema", async () => {
  await expect(createInventory(initialCreateInventoryState, inventoryForm())).resolves.toEqual({
    status: "success",
    message: "Inventory added.",
  });

  expect(collection).toHaveBeenCalledWith("inventories");
  expect(insertOne).toHaveBeenCalledWith({
    name: "Studio camera",
    description: "Main production camera",
    createdDate: expect.any(Date),
    updatedDate: expect.any(Date),
    photo: expect.any(Binary),
    photoContentType: "image/png",
  });
  const document = insertOne.mock.calls[0][0];
  expect(document.createdDate).toEqual(document.updatedDate);
  const stored = BSON.deserialize(BSON.serialize(document));
  expect(stored.photo).toBeInstanceOf(Binary);
  expect(stored.photo.sub_type).toBe(0);
  expect(Array.from(stored.photo.read(0, stored.photo.length()))).toEqual([0, 128, 255, 10]);
  expect(revalidatePath).toHaveBeenCalledWith("/inventories");
});

test.each([
  [{ name: "" }, "name"],
  [{ name: "x".repeat(121) }, "name"],
  [{ description: "" }, "description"],
  [{ description: "x".repeat(2001) }, "description"],
  [{ photo: "data:image/svg+xml;base64,PHN2Zz4=" }, "JPEG"],
  [{ photo: "not-base64" }, "JPEG"],
  [{ photo: new File(["svg"], "photo.svg", { type: "image/svg+xml" }) }, "JPEG"],
  [{ photo: new File([], "empty.jpg", { type: "image/jpeg" }) }, "JPEG"],
])("rejects invalid input before writing: %o", async (overrides, expectedMessage) => {
  const result = await createInventory(initialCreateInventoryState, inventoryForm(overrides));
  expect(result.status).toBe("error");
  expect(result.message).toContain(expectedMessage);
  expect(insertOne).not.toHaveBeenCalled();
});

test("allows a record without a photo", async () => {
  const form = inventoryForm();
  form.delete("photo");
  const result = await createInventory(initialCreateInventoryState, form);
  expect(result.status).toBe("success");
  expect(insertOne).toHaveBeenCalledWith(expect.objectContaining({ photo: null, photoContentType: null }));
});

test("does not expose database errors", async () => {
  insertOne.mockRejectedValueOnce(new Error("private connection details"));
  const result = await createInventory(initialCreateInventoryState, inventoryForm());
  expect(result.status).toBe("error");
  expect(result.message).not.toContain("private connection details");
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("accepts a 2 MB photo and rejects a photo above the stored size limit", async () => {
  const acceptedPhoto = new File([new Uint8Array(MAX_PHOTO_BYTES)], "photo.jpg", { type: "image/jpeg" });
  expect((await createInventory(initialCreateInventoryState, inventoryForm({ photo: acceptedPhoto }))).status).toBe("success");

  insertOne.mockClear();
  const oversizedPhoto = new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "photo.jpg", { type: "image/jpeg" });
  const result = await createInventory(initialCreateInventoryState, inventoryForm({ photo: oversizedPhoto }));
  expect(result.status).toBe("error");
  expect(result.message).toContain("2 MB");
  expect(insertOne).not.toHaveBeenCalled();
});
