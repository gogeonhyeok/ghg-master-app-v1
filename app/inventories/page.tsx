import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InventoryForm from "./InventoryForm";
import { getInventories } from "./data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Inventories | Go Gun Hyuk",
  description: "Create and browse inventory records stored in MongoDB.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}

export default async function InventoriesPage() {
  let inventories: Awaited<ReturnType<typeof getInventories>> = [];
  let unavailable = false;

  try {
    inventories = await getInventories();
  } catch {
    unavailable = true;
    console.warn("Inventories could not be loaded. Check the MongoDB configuration and connectivity.");
  }

  return (
    <main className={styles.page}>
      <article className={styles.container}>
        <nav className={styles.nav} aria-label="Breadcrumb">
          <Link href="/">← Workspace</Link>
          <span>/</span>
          <span>Inventories</span>
        </nav>

        <header className={styles.header}>
          <h1>Inventories</h1>
          <p className={styles.intro}>Browse and manage your inventory.</p>
        </header>

        <section className={styles.collection} aria-labelledby="inventory-list-title">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="inventory-list-title">Inventory records</h2>
            </div>
            {!unavailable && <span>{inventories.length} {inventories.length === 1 ? "item" : "items"}</span>}
          </div>

          {unavailable ? (
            <div className={styles.message} role="status">
              <span aria-hidden="true">!</span>
              <div><h3>Inventories are temporarily unavailable.</h3><p>Check the server connection, then try again.</p></div>
              <a href="/inventories">Retry</a>
            </div>
          ) : inventories.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">□</span>
              <h3>No inventory records yet.</h3>
              <p>Expand “Add an inventory” below to create the first record.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {inventories.map((inventory) => (
                <article key={inventory.id} className={styles.card}>
                  <div className={styles.photo}>
                    {inventory.photo ? (
                      <Image src={inventory.photo} alt={`Photo of ${inventory.name}`} fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized />
                    ) : (
                      <span aria-hidden="true">{inventory.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{inventory.name}</h3>
                    <p>{inventory.description || "No description provided."}</p>
                    <dl className={styles.dates}>
                      <div><dt>Created</dt><dd><time dateTime={inventory.createdDate || undefined}>{formatDate(inventory.createdDate)}</time></dd></div>
                      <div><dt>Updated</dt><dd><time dateTime={inventory.updatedDate || undefined}>{formatDate(inventory.updatedDate)}</time></dd></div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <InventoryForm />
      </article>
    </main>
  );
}
