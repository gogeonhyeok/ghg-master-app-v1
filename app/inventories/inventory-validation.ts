export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/;

export function isValidPhotoDataUrl(value: string): boolean {
  const match = DATA_URL_PATTERN.exec(value);
  if (!match) return false;

  const payload = match[2];
  if (payload.length % 4 !== 0) return false;

  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  const decodedBytes = (payload.length * 3) / 4 - padding;
  return decodedBytes <= MAX_PHOTO_BYTES;
}
