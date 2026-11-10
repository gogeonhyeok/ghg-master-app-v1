"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { getCoffeeMenus } from "./menu-actions";
import type { CoffeeMenus } from "./menus";
import styles from "./coffee.module.css";

export default function CoffeeMenuSection() {
  const [menus, setMenus] = useState<CoffeeMenus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);

  const loadMenus = useCallback(async () => {
    const currentRequest = ++request.current;
    setLoading(true);
    setError("");
    try {
      const result = await getCoffeeMenus();
      if (request.current !== currentRequest) return;
      if (result.ok) setMenus(result.data);
      else setError(result.message);
    } catch {
      if (request.current === currentRequest) setError("Couldn’t load coffee menus. Please refresh to try again.");
    } finally {
      if (request.current === currentRequest) setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(async () => { await loadMenus(); });
    return () => { request.current++; };
  }, [loadMenus]);

  return (
    <section className={styles.coffeeMenus} aria-labelledby="coffee-menu-title" aria-busy={loading}>
      <header>
        <div>
          <p className={styles.eyebrow}>From cafe menus</p>
          <h2 id="coffee-menu-title">Coffee menus</h2>
          <p>Explore drinks from published cafe menus. Prices are shown in each cafe’s original currency.</p>
        </div>
        <button type="button" disabled={loading} onClick={() => startTransition(async () => { await loadMenus(); })}>
          {loading ? "Loading menus…" : "Refresh menus"}
        </button>
      </header>
      <p role="status" className={error ? styles.orderError : undefined}>
        {error ? `${error}${menus ? " Previously loaded menus remain below." : ""}` :
          loading ? "Loading coffee menus…" : `${menus?.count ?? 0} drinks across ${menus?.cafes.length ?? 0} cafe menus`}
      </p>
      {menus && <>
        {!menus.items.length && <p>No coffee drinks found in the returned menus.</p>}
        {menus.cafes.map((cafe, cafeIndex) => {
          const items = menus.items.filter((item) => item.restaurant.slug === cafe.slug);
          return (
            <article key={cafe.slug} aria-labelledby={`cafe-menu-${cafeIndex}`}>
              <header>
                <div>
                  <h3 id={`cafe-menu-${cafeIndex}`}>{cafe.name}</h3>
                  <p>{[cafe.city, cafe.country].filter(Boolean).join(" · ")}</p>
                </div>
                <a href={cafe.url} target="_blank" rel="noopener noreferrer">View cafe menu <span aria-hidden="true">↗</span></a>
              </header>
              {items.length ? <ul>{items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <p>{item.category}</p>
                  <h4>{item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                  <strong>{new Intl.NumberFormat("en-SG", {
                    style: "currency", currency: item.currency, currencyDisplay: "code",
                  }).format(item.price)}</strong>
                  <span data-available={item.isAvailable}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                </li>
              ))}</ul> : <p>No matching coffee drinks in this cafe’s menu.</p>}
            </article>
          );
        })}
        <footer>
          <p>{menus.coverage}</p>
          <p>Source: <a href={menus.source.url} target="_blank" rel="noopener noreferrer">{menus.source.provider}</a> · Retrieved <time dateTime={menus.source.retrievedAt}>{new Intl.DateTimeFormat("en-SG", {
            dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Singapore",
          }).format(new Date(menus.source.retrievedAt))} SGT</time></p>
        </footer>
      </>}
    </section>
  );
}
