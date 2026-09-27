"use client";

import { useEffect, useState } from "react";
import catalog from "./softwares.json" with { type: "json" };
import styles from "./page.module.css";

type Software = {
  name: string;
  manufacturers?: string[];
  description?: string;
  price?: number;
  currency?: string;
  written?: string;
  specifications?: { key: string; value: string }[];
};
const softwares: Software[] = catalog;
const manufacturers = [...new Set(softwares.flatMap((item) => item.manufacturers ?? []))].sort();

export default function SoftwaresPage() {
  const [dark, setDark] = useState(true);
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [currency, setCurrency] = useState("");
  useEffect(() => {
    try {
      // Restore the browser preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(localStorage.getItem("softwares-theme") !== "light");
    } catch { /* Keep the default if storage is unavailable. */ }
  }, []);
  function toggleTheme() {
    setDark(!dark);
    try { localStorage.setItem("softwares-theme", dark ? "light" : "dark"); } catch { /* Switching still works without storage. */ }
  }
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = softwares.filter((item) => {
    const text = `${item.name} ${item.manufacturers?.join(" ") ?? ""} ${item.description ?? ""} ${item.specifications?.map((spec) => `${spec.key} ${spec.value}`).join(" ") ?? ""}`.toLowerCase();
    return terms.every((term) => text.includes(term)) && (!manufacturer || item.manufacturers?.includes(manufacturer)) && (!currency || item.currency === currency);
  });
  function clearFilters() { setQuery(""); setManufacturer(""); setCurrency(""); }

  return <div className={styles.page} data-theme={dark ? "dark" : "light"}>
    <main className={styles.container}>
      <header className={styles.topbar}>
        <a href="/softwares" className={styles.brand}><span aria-hidden="true">S</span> Software library</a>
        <button className={styles.themeButton} type="button" onClick={toggleTheme} aria-label="Dark mode" aria-pressed={dark}>{dark ? "☀ Light mode" : "☾ Dark mode"}</button>
      </header>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>THE SOFTWARE CATALOG</p>
        <h1>Your tools.<br /><span>One place to explore.</span></h1>
        <p className={styles.intro}>Browse development tools, UI libraries, productivity apps, and operating systems from your collection.</p>
        <div className={styles.stats}><span><strong>{softwares.length}</strong> software entries</span><span><strong>{manufacturers.length}</strong> recorded manufacturers</span><span><strong>2017–2018</strong> historical records</span></div>
      </section>
      <section className={styles.directory} aria-labelledby="catalog-heading">
        <div className={styles.heading}><h2 id="catalog-heading">Explore the library</h2><p>Prices reflect the original records, not current offers.</p></div>
        <div className={styles.filters}>
          <label className={styles.search}>Search software<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, manufacturers, or notes…" aria-controls="software-results" /></label>
          <label>Manufacturer<select value={manufacturer} onChange={(event) => setManufacturer(event.target.value)}><option value="">All manufacturers</option>{manufacturers.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label>Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">All currencies</option><option>USD</option><option>KRW</option></select></label>
        </div>
        <div className={styles.resultsBar}><p role="status">{visible.length} of {softwares.length} entries</p>{(query || manufacturer || currency) && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>
        <ul className={styles.grid} id="software-results">{visible.map((item) => <li className={styles.card} key={item.name}>
          <div className={styles.cardTop}><span className={styles.tag}>{item.manufacturers?.join(" · ") ?? "Manufacturer not recorded"}</span><span className={styles.icon} aria-hidden="true">↗</span></div>
          <h3>{item.name}</h3>
          {item.description && <p className={styles.description}>{item.description}</p>}
          {item.specifications && <ul className={styles.specs}>{item.specifications.map((spec) => <li key={spec.key}>{spec.key === "subscription-iteration" ? "Subscription" : spec.key}: {spec.value === "1year" ? "1 year" : spec.value}</li>)}</ul>}
          <div className={styles.cardBottom}>
            <div className={styles.price}>{item.price === undefined ? <span>Price not recorded</span> : <><strong>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(item.price)}</strong> <span>{item.currency}</span></>}</div>
            {item.written ? <time dateTime={item.written}>Recorded {item.written}</time> : <span className={styles.date}>Date not recorded</span>}
          </div>
        </li>)}</ul>
        {!visible.length && <div className={styles.empty}><h3>No matching software</h3><p>Try a different search or reset your filters.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>}
      </section>
      <footer className={styles.footer}><span>Software library / Glossaries</span><span>Historical catalog · Original prices and currencies preserved</span></footer>
    </main>
  </div>;
}
