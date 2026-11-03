"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { beanRetailers, formatSgd, pricePer100g, type BeanListing, type BeanPriceResponse } from "./bean-prices";
import { BEAN_STORAGE_KEY, emptyTracker, readTracker, recordBeanPrices, type BeanTrackerState, type PriceObservation } from "./bean-history";

function checkedLabel(value: string) {
  return new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" }).format(new Date(value));
}

async function requestPrices(signal: AbortSignal): Promise<BeanPriceResponse> {
  const response = await fetch("/api/coffee/bean-prices", { cache: "no-store", signal });
  if (!response.ok) throw new Error("Prices unavailable");
  const data: BeanPriceResponse = await response.json();
  if (data.currency !== "SGD" || !Array.isArray(data.listings)) throw new Error("Invalid price data");
  return data;
}

export default function BeanPriceTracker() {
  const [listings, setListings] = useState<BeanListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [tracker, setTracker] = useState(emptyTracker);
  const trackerRef = useRef(tracker);
  const [retailer, setRetailer] = useState("all");
  const [query, setQuery] = useState("");
  const [watchOnly, setWatchOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("unit");
  const [sizes, setSizes] = useState<Record<string, string>>({});

  const saveTracker = useCallback((next: BeanTrackerState) => {
    trackerRef.current = next;
    setTracker(next);
    try { localStorage.setItem(BEAN_STORAGE_KEY, JSON.stringify(next)); }
    catch { setStorageUnavailable(true); }
  }, []);

  const loadPrices = useCallback((signal: AbortSignal) => {
    void requestPrices(signal).then((data) => {
      if (signal.aborted) return;
      setListings(data.listings);
      saveTracker(recordBeanPrices(trackerRef.current, data.listings));
      setError(false);
    }).catch(() => {
      if (signal.aborted) return;
      setError(true);
      setTracker(trackerRef.current);
    }).finally(() => {
      if (!signal.aborted) setLoading(false);
    });
  }, [saveTracker]);

  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    try { trackerRef.current = readTracker(localStorage.getItem(BEAN_STORAGE_KEY)); }
    catch { /* The tracker still works for this visit without browser storage. */ }
    const controller = new AbortController();
    request.current = controller;
    void loadPrices(controller.signal);
    return () => request.current?.abort();
  }, [loadPrices]);

  function refresh() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    void loadPrices(controller.signal);
  }

  function toggleWatch(id: string) {
    const current = trackerRef.current;
    saveTracker({ ...current, watched: current.watched.includes(id) ? current.watched.filter((value) => value !== id) : [...current.watched, id] });
  }

  const rows = listings.map((listing) => ({ listing, variant: listing.variants.find((variant) => variant.id === sizes[listing.id]) ?? listing.variants[0] }))
    .filter(({ listing, variant }) => (retailer === "all" || listing.retailerId === retailer) &&
      (!watchOnly || tracker.watched.includes(listing.id)) && (!inStockOnly || variant?.available) &&
      `${listing.name} ${listing.retailer}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.listing.name.localeCompare(b.listing.name);
      const value = (row: typeof a) => row.variant ? (sort === "bag" ? row.variant.priceCents / 100 : pricePer100g(row.variant)) : Infinity;
      return value(a) - value(b) || a.listing.name.localeCompare(b.listing.name);
    });
  const available = rows.flatMap(({ variant }) => variant?.available ? [pricePer100g(variant)] : []);
  const missing = listings.filter((listing) => !listing.variants.length).length;

  return (
    <section aria-labelledby="bean-tracker-title" id="bean-prices">
      <header>
        <div><p><span aria-hidden="true" />Singapore bean watch · SGD</p><h2 id="bean-tracker-title">Find your next <em>daily bean.</em></h2><p>Compare whole-bean bags from Singapore roasters. Keep an eye on your favourites, one price check at a time.</p></div>
        <button type="button" onClick={refresh} disabled={loading}><span aria-hidden="true">↻</span>{loading ? "Checking prices…" : "Refresh listings"}</button>
      </header>

      <dl>
        <div><dt>Beans followed</dt><dd>{tracker.watched.length.toString().padStart(2, "0")}</dd></div>
        <div><dt>Singapore roasters</dt><dd>{beanRetailers.length.toString().padStart(2, "0")}</dd></div>
        <div><dt>Lowest shown · in stock / 100g</dt><dd>{available.length ? formatSgd(Math.min(...available)) : "—"}</dd></div>
        <div><dt>A fairer comparison.</dt><dd>Bag prices normalised by coffee weight.</dd></div>
      </dl>

      <form role="search" aria-label="Filter coffee beans" onSubmit={(event) => event.preventDefault()}>
        <label><span aria-hidden="true">⌕</span><input type="search" aria-label="Search coffee beans" placeholder="Find a bean or roaster" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>Roaster<select value={retailer} onChange={(event) => setRetailer(event.target.value)}><option value="all">All roasters</option>{beanRetailers.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label>
        <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="unit">Price / 100g</option><option value="bag">Bag price</option><option value="name">Bean name</option></select></label>
      </form>
      <div role="group" aria-label="Bean filters"><button type="button" aria-pressed={watchOnly} onClick={() => setWatchOnly(!watchOnly)}>My watchlist <span>{tracker.watched.length}</span></button><label><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />In stock only</label><span aria-live="polite">{rows.length} {rows.length === 1 ? "bean" : "beans"} shown</span></div>

      <div aria-live="polite">
        {loading && !listings.length && <p>Checking the roasters’ current listings…</p>}
        {error && <p role="status">We couldn’t refresh prices. {listings.length ? "Previously loaded listings remain below." : "Try again in a moment, or visit the roasters directly below."}</p>}
        {!!missing && <p>{missing} {missing === 1 ? "listing is" : "listings are"} temporarily unavailable. No estimated prices are shown.</p>}
      </div>

      <ul aria-label="Coffee bean listings">
        {rows.map(({ listing, variant }) => {
          const watched = tracker.watched.includes(listing.id);
          const history = variant ? tracker.history[`${listing.id}:${variant.id}`] ?? [] : [];
          return <li key={listing.id}><article aria-label={listing.name}>
            <header><span>{listing.retailer}</span><button type="button" aria-pressed={watched} aria-label={`${watched ? "Unfollow" : "Follow"} ${listing.name}`} onClick={() => toggleWatch(listing.id)}><span aria-hidden="true">{watched ? "★" : "☆"}</span></button></header>
            <h3>{listing.name}</h3>
            <span data-available={variant?.available ?? false}>{variant ? variant.available ? "In stock" : "Out of stock" : "Price unavailable"}</span>
            {variant ? <>
              <label>Bag size / roast<select aria-label={`Bag size for ${listing.name}`} value={variant.id} onChange={(event) => setSizes({ ...sizes, [listing.id]: event.target.value })}>{listing.variants.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
              <p><strong>{formatSgd(variant.priceCents / 100)}</strong><span>{formatSgd(pricePer100g(variant))} / 100g</span></p>
              <PriceHistory observations={history} />
              <footer><span>Checked {listing.checkedAt ? <time dateTime={listing.checkedAt}>{checkedLabel(listing.checkedAt)} SGT</time> : "—"}</span><a href={`${listing.url}?variant=${variant.id}`} target="_blank" rel="noopener noreferrer" aria-label={`View at roaster — ${listing.name}`}>View at roaster <span aria-hidden="true">↗</span></a></footer>
            </> : <div><p>The roaster may be updating its listing or limiting requests. Check the store for the latest price.</p><a href={listing.url} target="_blank" rel="noopener noreferrer">Check {listing.retailer} ↗</a></div>}
          </article></li>;
        })}
      </ul>
      {!loading && !!listings.length && !rows.length && <p>{watchOnly ? "No followed beans match these filters. Follow a bean using its star, or turn off My watchlist." : "No beans match these filters. Try another roaster or search."}</p>}
      <footer><p>One-off whole-bean prices in SGD. Shipping, checkout discounts and subscriptions are excluded. Retailer feeds are cached for up to one hour.</p><p>Stars and up to 60 price observations per bag are saved in this browser. History builds when you visit or refresh; background tracking and alerts are not enabled.</p>{storageUnavailable && <p role="status">Browser storage is unavailable. Your watchlist and history will last for this visit only.</p>}<nav aria-label="Coffee bean price sources">Sources: {beanRetailers.map((source) => <a key={source.id} href={`${source.origin}/collections/${source.collection}`} target="_blank" rel="noopener noreferrer">{source.name} ↗</a>)}</nav></footer>
    </section>
  );
}

function PriceHistory({ observations }: { observations: PriceObservation[] }) {
  const recent = observations.slice(-12);
  const change = recent.length > 1 ? recent[recent.length - 1].priceCents - recent[recent.length - 2].priceCents : null;
  const values = recent.map((point) => point.priceCents);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = recent.map((point, i) => `${4 + i * 92 / Math.max(recent.length - 1, 1)},${28 - (point.priceCents - min) * 20 / range}`).join(" ");
  return <figure aria-label="Observed bag price history">
    <figcaption data-direction={change === null || change === 0 ? "flat" : change < 0 ? "down" : "up"}>{change === null ? "History starts with this check" : change === 0 ? "Unchanged since last check" : `${change < 0 ? "↓" : "↑"} ${formatSgd(Math.abs(change) / 100)} since last check`}</figcaption>
    {recent.length > 1 && <svg viewBox="0 0 100 36" role="img" aria-label={`Last ${recent.length} observed bag prices: ${values.map((value) => formatSgd(value / 100)).join(", ")}`}><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </figure>;
}
