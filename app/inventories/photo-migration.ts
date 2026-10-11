import { Binary, type Collection } from "mongodb";

type LegacyPhoto = { photo: unknown; photoContentType?: unknown };

// The decoder is supplied by the CLI so it can reuse validation without a Next.js runtime.
export async function migrateInventoryPhotos(
  collection: Collection<LegacyPhoto>,
  decode: (value: string) => { bytes: Uint8Array; contentType: string } | null,
  apply = false,
) {
  const summary = { eligible: 0, migrated: 0, skipped: 0, conflicts: 0, bytesSaved: 0 };
  const cursor = collection.find(
    { photo: { $type: "string", $regex: "^data:image/" } },
    { projection: { photo: 1 }, batchSize: 10 },
  );
  try {
    for await (const document of cursor) {
      if (typeof document.photo !== "string") {
        summary.skipped++;
        continue;
      }
      const decoded = decode(document.photo);
      if (!decoded || decoded.bytes.byteLength === 0) {
        summary.skipped++;
        continue;
      }
      summary.eligible++;
      if (apply) {
        // Do not overwrite a photo changed since it was read. Dates and other fields stay intact.
        const result = await collection.updateOne(
          { _id: document._id, photo: document.photo },
          { $set: { photo: new Binary(decoded.bytes), photoContentType: decoded.contentType } },
        );
        if (result.modifiedCount !== 1) {
          summary.conflicts++;
          continue;
        }
        const stored = await collection.findOne({ _id: document._id }, { projection: { photo: 1, photoContentType: 1 } });
        if (!(stored?.photo instanceof Binary)
          || stored.photoContentType !== decoded.contentType
          || !Buffer.from(stored.photo.read(0, stored.photo.length())).equals(new Uint8Array(decoded.bytes))) {
          throw new Error("Migrated photo verification failed.");
        }
        summary.migrated++;
      }
      summary.bytesSaved += Buffer.byteLength(document.photo) - decoded.bytes.byteLength;
    }
  } finally {
    await cursor.close();
  }
  return summary;
}
