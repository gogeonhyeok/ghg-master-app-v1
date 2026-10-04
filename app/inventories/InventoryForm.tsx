"use client";

import { useActionState, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { createInventory } from "./actions";
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES } from "./inventory-validation";
import { initialCreateInventoryState, type CreateInventoryState } from "./types";
import styles from "./page.module.css";

// Helper to compress image using canvas
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function InventoryForm() {
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [readingPhoto, setReadingPhoto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (previousState: CreateInventoryState, formData: FormData) => {
    const result = await createInventory(previousState, formData);
    if (result.status === "success") {
      formRef.current?.reset();
      setPhoto("");
      setPhotoError("");
    }
    return result;
  }, initialCreateInventoryState);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    setPhoto("");
    setPhotoError("");
    if (!file) return;

    // Allow larger files because we will compress them
    const MAX_RAW_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number]) || file.size > MAX_RAW_FILE_SIZE) {
      setPhotoError("Choose a valid image file no larger than 10 MB.");
      event.currentTarget.value = "";
      return;
    }

    setReadingPhoto(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setPhoto(compressedDataUrl);
    } catch (err) {
      setPhotoError("This photo could not be processed. Choose another file.");
      event.currentTarget.value = "";
    } finally {
      setReadingPhoto(false);
    }
  }, []);

  return (
    <details className={styles.createPanel}>
      <summary className={styles.panelHeading}>
        <span
          >
            <span className={styles.eyebrow}>NEW RECORD</span>
            <span className={styles.panelTitle}>Add an inventory</span>
          </span
        >
        <span className={styles.expandIcon} aria-hidden="true">
          +
        </span>
      </summary>

      <form ref={formRef} action={formAction} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="inventory-name">Name</label>
          <input
            id="inventory-name"
            name="name"
            maxLength={120}
            required
            placeholder="e.g. Studio camera"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory-description">Description</label>
          <textarea
            id="inventory-description"
            name="description"
            maxLength={2000}
            required
            rows={5}
            placeholder="Add condition, location, or other useful notes."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory-photo">
            Photo <span className={styles.optionalText}>optional</span>
          </label>
          <input
            id="inventory-photo"
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(",")}
            capture="environment"
            aria-describedby="photo-help photo-error"
            onChange={handleFileChange}
          />
          <input type="hidden" name="photo" value={photo} />
          <p id="photo-help" className={styles.help}>
            Images are automatically compressed for fast upload.
          </p>
          {photoError && (
            <p id="photo-error" className={styles.fieldError} role="alert">
              {photoError}
            </p>
          )}
          {photo && (
            <Image
              className={styles.preview}
              src={photo}
              alt="Selected inventory preview"
              width={240}
              height={150}
              unoptimized
            />
          )}
        </div>

        <div className={styles.formFooter}>
          <p className={styles.schemaNote}>
            Dates are created automatically when the record is saved.
          </p>
          <button
            type="submit"
            disabled={pending || readingPhoto || Boolean(photoError)}
          >
            {pending ? "Saving…" : readingPhoto ? "Compressing photo…" : "Add inventory"}
          </button>
        </div>
        {state.message && (
          <p
            className={state.status === "error" ? styles.formError : styles.formSuccess}
            role={state.status === "error" ? "alert" : "status"}
          >
            {state.message}
          </p>
        )}
      </form>
    </details>
  );
}
