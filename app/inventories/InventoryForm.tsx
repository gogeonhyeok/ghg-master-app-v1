"use client";

import { useActionState, useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { createInventory } from "./actions";
import { ACCEPTED_PHOTO_TYPES, isValidPhotoFile } from "./inventory-validation";
import { initialCreateInventoryState, type CreateInventoryState } from "./types";
import styles from "./page.module.css";

// Helper to compress image using canvas
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const sourceUrl = URL.createObjectURL(file);
    img.onload = () => {
      try {
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
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Could not compress image"));
        }, "image/jpeg", 0.7);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(sourceUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = sourceUrl;
  });
}

export default function InventoryForm() {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [readingPhoto, setReadingPhoto] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const [state, formAction, pending] = useActionState(async (previousState: CreateInventoryState, formData: FormData) => {
    if (photo) formData.set("photo", photo, "inventory.jpg");
    else formData.delete("photo");
    const result = await createInventory(previousState, formData);
    if (result.status === "success") {
      formRef.current?.reset();
      setPhoto(null);
      setPhotoPreview("");
      setPhotoError("");
    }
    return result;
  }, initialCreateInventoryState);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    setPhoto(null);
    setPhotoPreview("");
    setPhotoError("");
    if (!file) return;

    // Allow larger files because we will compress them
    const MAX_RAW_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number]) || file.size > MAX_RAW_FILE_SIZE) {
      setPhotoError("Choose a valid image file no larger than 10 MB.");
      input.value = "";
      return;
    }

    setReadingPhoto(true);
    try {
      const compressedPhoto = await compressImage(file);
      if (!isValidPhotoFile(compressedPhoto)) {
        setPhotoError("The compressed photo is too large. Choose an image that compresses to 2 MB or less.");
        input.value = "";
        return;
      }
      setPhoto(compressedPhoto);
      setPhotoPreview(URL.createObjectURL(compressedPhoto));
    } catch {
      setPhotoError("This photo could not be processed. Choose another file.");
      input.value = "";
    } finally {
      setReadingPhoto(false);
    }
  }, []);

  return (
    <details className={styles.createPanel}>
      <summary className={styles.panelHeading}>
        <span>
          <span className={styles.eyebrow}>NEW RECORD</span>
          <span className={styles.panelTitle}>Add an inventory</span>
        </span>
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
            Photo <span>optional</span>
          </label>
          <input
            id="inventory-photo"
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(",")}
            capture="environment"
            disabled={pending || readingPhoto}
            aria-describedby="photo-help photo-error"
            onChange={handleFileChange}
          />
          <p id="photo-help" className={styles.help}>
            Choose an image up to 10 MB. It will be compressed for upload (2 MB maximum).
          </p>
          {photoError && (
            <p id="photo-error" className={styles.fieldError} role="alert">
              {photoError}
            </p>
          )}
          {photoPreview && (
            <Image
              className={styles.preview}
              src={photoPreview}
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
