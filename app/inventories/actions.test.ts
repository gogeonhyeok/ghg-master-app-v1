/** @jest-environment node */
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("./data", () => ({
  getInventoriesDatabase: jest.fn(),
  INVENTORIES_COLLECTION: "inventories",
}));

import { revalidatePath } from "next/cache";
import { createInventory } from "./actions";
import { getInventoriesDatabase } from "./data";
import { initialCreateInventoryState } from "./types";

const insertOne = jest.fn();
const collection = jest.fn(() => ({ insertOne }));

function inventoryForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("name", overrides.name ?? " Studio camera ");
  formData.set("description", overrides.description ?? " Main production camera ");
  formData.set("photo", overrides.photo ?? "data:image/png;base64,aGVsbG8=");
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
    photo: "data:image/png;base64,aGVsbG8=",
  });
  const document = insertOne.mock.calls[0][0];
  expect(document.createdDate).toEqual(document.updatedDate);
  expect(revalidatePath).toHaveBeenCalledWith("/inventories");
});

test.each([
  [{ name: "" }, "name"],
  [{ name: "x".repeat(121) }, "name"],
  [{ description: "" }, "description"],
  [{ description: "x".repeat(2001) }, "description"],
  [{ photo: "data:image/svg+xml;base64,PHN2Zz4=" }, "JPEG"],
  [{ photo: "not-base64" }, "JPEG"],
])("rejects invalid input before writing: %o", async (overrides, expectedMessage) => {
  const result = await createInventory(initialCreateInventoryState, inventoryForm(overrides));
  expect(result.status).toBe("error");
  expect(result.message).toContain(expectedMessage);
  expect(insertOne).not.toHaveBeenCalled();
});

test("allows a record without a photo while preserving the property", async () => {
  const result = await createInventory(initialCreateInventoryState, inventoryForm({ photo: "" }));
  expect(result.status).toBe("success");
  expect(insertOne).toHaveBeenCalledWith(expect.objectContaining({ photo: "" }));
});

test("does not expose database errors", async () => {
  insertOne.mockRejectedValueOnce(new Error("private connection details"));
  const result = await createInventory(initialCreateInventoryState, inventoryForm());
  expect(result.status).toBe("error");
  expect(result.message).not.toContain("private connection details");
  expect(revalidatePath).not.toHaveBeenCalled();
});
