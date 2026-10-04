"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { createInventory } from "./actions";
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES } from "./inventory-validation";
import { initialCreateInventoryState, type CreateInventoryState } from "./types";
import styles from "./page.module.css";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
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

  return (
    <details className={styles.createPanel}>
      <summary className={styles.panelHeading}>
        <span>
          <span className={styles.eyebrow}>NEW RECORD</span>
          <span className={styles.panelTitle}>Add an inventory</span>
        </span>
        <span className={styles.expandIcon} aria-hidden="true">+</span>
      </summary>

      <form ref={formRef} action={formAction} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="inventory-name">Name</label>
          <input id="inventory-name" name="name" maxLength={120} required placeholder="e.g. Studio camera" />
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory-description">Description</label>
          <textarea id="inventory-description" name="description" maxLength={2000} required rows={5} placeholder="Add condition, location, or other useful notes." />
        </div>

        <div className={styles.field}>
          <label htmlFor="inventory-photo">Photo <span>optional</span></label>
          <input
            id="inventory-photo"
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(",")}
            aria-describedby="photo-help photo-error"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              setPhoto("");
              setPhotoError("");
              if (!file) return;
              if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number]) || file.size > MAX_PHOTO_BYTES) {
                setPhotoError("Choose a JPEG, PNG, WebP, or GIF image no larger than 512 KB.");
                event.currentTarget.value = "";
                return;
              }
              setReadingPhoto(true);
              try {
                setPhoto(await readAsDataUrl(file));
              } catch {
                setPhotoError("This photo could not be read. Choose another file.");
                event.currentTarget.value = "";
              } finally {
                setReadingPhoto(false);
              }
            }}
          />
          <input type="hidden" name="photo" value={photo} />
          <p id="photo-help" className={styles.help}>Stored in MongoDB as a base64 data URL. Maximum 512 KB.</p>
          {photoError && <p id="photo-error" className={styles.fieldError} role="alert">{photoError}</p>}
          {photo && <Image className={styles.preview} src={photo} alt="Selected inventory preview" width={240} height={150} unoptimized />}
        </div>

        <div className={styles.formFooter}>
          <p className={styles.schemaNote}>Dates are created automatically when the record is saved.</p>
          <button type="submit" disabled={pending || readingPhoto || Boolean(photoError)}>
            {pending ? "Saving…" : readingPhoto ? "Reading photo…" : "Add inventory"}
          </button>
        </div>
        {state.message && (
          <p className={state.status === "error" ? styles.formError : styles.formSuccess} role={state.status === "error" ? "alert" : "status"}>
            {state.message}
          </p>
        )}
      </form>
    </details>
  );
}
