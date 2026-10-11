# Inventory photos

New uploads are compressed JPEG files (1280 × 1280 maximum, 2 MB maximum), sent as multipart binary data and saved in `ghg-master-api-v1.inventories`:

- `photo`: BSON Binary, subtype 0, or `null` when no photo was supplied.
- `photoContentType`: the MIME type, or `null` when no photo was supplied.

The inventory list projects a `hasPhoto` flag instead of loading image bytes. Photos are served by `/inventories/<ObjectId>/photo`. This endpoint also reads legacy Base64 data URLs until they are migrated. The page's existing public visibility applies to the image endpoint too.

## Convert existing Base64 records

From the `ghg-master-app-v1` project root, using Node.js 22.18+ and the existing `MONGODB_URI` / `MONGODB_URL` environment configuration:

```sh
node app/inventories/migrate-photos.mjs
node app/inventories/migrate-photos.mjs --apply
```

The first command reports a dry run. The second replaces valid image data URLs with BSON Binary and stores their MIME types, then reads back each updated photo to verify its bytes and MIME type. Invalid or oversized data URLs are skipped; other inventory fields and timestamps are preserved. Updates compare the original photo value to avoid overwriting concurrent changes. The command can be rerun safely: migrated binary records are not selected again.

MongoDB Compass may display BSON Binary using Extended JSON (`$binary.base64`). This is a textual display of binary data, not a Base64 string stored in the document.
