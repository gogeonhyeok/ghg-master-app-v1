/** @jest-environment node */
import { Binary, ObjectId } from "mongodb";
import { migrateInventoryPhotos } from "./photo-migration";

const legacy = "data:image/png;base64,aGVsbG8=";
const decode = (value: string) => value === legacy ? { bytes: Buffer.from("hello"), contentType: "image/png" } : null;

function fixture() {
  const id = new ObjectId();
  const cursor = {
    async *[Symbol.asyncIterator]() {
      yield { _id: id, photo: legacy };
      yield { _id: new ObjectId(), photo: "data:image/png;base64,invalid" };
    },
    close: jest.fn(),
  };
  const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  const findOne = jest.fn().mockResolvedValue({ photo: new Binary(Buffer.from("hello")), photoContentType: "image/png" });
  return { id, cursor, updateOne, findOne, collection: { find: jest.fn(() => cursor), updateOne, findOne } };
}

test("dry run counts valid records without writes", async () => {
  const { collection, updateOne, cursor } = fixture();
  expect(await migrateInventoryPhotos(collection as never, decode)).toEqual({
    eligible: 1, migrated: 0, skipped: 1, conflicts: 0, bytesSaved: legacy.length - 5,
  });
  expect(updateOne).not.toHaveBeenCalled();
  expect(cursor.close).toHaveBeenCalled();
});

test("migration writes binary with the MIME type and guards against concurrent edits", async () => {
  const { id, collection, updateOne } = fixture();
  expect((await migrateInventoryPhotos(collection as never, decode, true)).migrated).toBe(1);
  expect(updateOne).toHaveBeenCalledWith({ _id: id, photo: legacy }, {
    $set: { photo: expect.any(Binary), photoContentType: "image/png" },
  });
  expect(Buffer.from(updateOne.mock.calls[0][1].$set.photo.read(0, updateOne.mock.calls[0][1].$set.photo.length())).toString()).toBe("hello");
});

test("counts concurrent changes without overwriting or reporting them as migrated", async () => {
  const { collection, updateOne } = fixture();
  updateOne.mockResolvedValue({ modifiedCount: 0 });
  expect(await migrateInventoryPhotos(collection as never, decode, true)).toEqual({
    eligible: 1, migrated: 0, skipped: 1, conflicts: 1, bytesSaved: 0,
  });
});

test("fails verification if the stored bytes differ", async () => {
  const { collection, findOne, cursor } = fixture();
  findOne.mockResolvedValue({ photo: new Binary(Buffer.from("different")), photoContentType: "image/png" });
  await expect(migrateInventoryPhotos(collection as never, decode, true)).rejects.toThrow("verification failed");
  expect(cursor.close).toHaveBeenCalled();
});
