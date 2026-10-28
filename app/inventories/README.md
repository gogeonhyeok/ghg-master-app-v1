# Inventory photos

New uploads are compressed JPEG files (1280 × 1280 maximum, 2 MB maximum). The form sends the file to the inventory server action, which uploads the raw bytes with `PUT https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/photos/<ObjectId>` and the image's `Content-Type`. The Lambda stores the file in S3. The inventory is inserted only after the upload succeeds, using the same ObjectId for the record and photo.

The `ghg-master-api-v1.inventories` document stores:

- `photo`: the absolute Lambda photo URL, or `null` when no photo was supplied. New records contain no image bytes or Base64 data.
- `photoContentType`: the MIME type, or `null` when no photo was supplied.

The inventory list projects photo URLs and a `hasPhoto` flag instead of loading image bytes. New photos load directly through the Lambda's `GET /photos/<ObjectId>` endpoint. Existing BSON Binary and Base64 photos continue to be served by `/inventories/<ObjectId>/photo`; existing records are not automatically migrated to S3. The page's existing public visibility applies to photos too.

The Lambda is called by the server, so uploads do not require browser CORS configuration. If the S3 upload succeeds but the subsequent MongoDB insert fails, the S3 object may remain unreferenced; the Lambda currently provides no delete endpoint for cleanup.

## Legacy Base64-to-BSON migration

This older utility converts Base64 strings to BSON Binary within MongoDB; it does not move photos to S3 and is not needed for new uploads.

From the `ghg-master-app-v1` project root, using Node.js 22.18+ and the existing `MONGODB_URI` / `MONGODB_URL` environment configuration:

```sh
node app/inventories/migrate-photos.mjs
node app/inventories/migrate-photos.mjs --apply
```

The first command reports a dry run. The second replaces valid image data URLs with BSON Binary and stores their MIME types, then reads back each updated photo to verify its bytes and MIME type. Invalid or oversized data URLs are skipped; other inventory fields and timestamps are preserved. Updates compare the original photo value to avoid overwriting concurrent changes. The command can be rerun safely: migrated binary records are not selected again.

MongoDB Compass may display BSON Binary using Extended JSON (`$binary.base64`). This is a textual display of binary data, not a Base64 string stored in the document.
