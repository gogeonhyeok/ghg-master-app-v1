"use client";

import { useEffect, useRef, useState } from "react";
import { foodOptions } from "./food-options";
import { medicalOptions } from "./medical-options";
import styles from "./page.module.css";

function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let saved = true;
    try {
      saved = localStorage.getItem("segar-theme") !== "light";
    } catch { /* Keep dark mode when storage is unavailable. */ }
    button.current?.closest("[data-segar-theme]")?.setAttribute("data-segar-theme", saved ? "dark" : "light");
    // Restore a browser-only preference after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(saved);
  }, []);

  function toggleTheme() {
    const next = !dark;
    const theme = next ? "dark" : "light";
    setDark(next);
    button.current?.closest("[data-segar-theme]")?.setAttribute("data-segar-theme", theme);
    try {
      localStorage.setItem("segar-theme", theme);
    } catch { /* Switching still works without persistent storage. */ }
  }

  return (
    <button ref={button} type="button" className={styles.themeToggle} onClick={toggleTheme} aria-label="Dark mode" aria-pressed={dark}>
      <span aria-hidden="true">{dark ? "☀" : "☾"}</span> {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}

const neighbourhoods = [
  {
    number: "01",
    name: "Segar Road",
    detail: "A calm residential pocket with easy access to daily essentials and open skies.",
  },
  {
    number: "02",
    name: "Hillion Mall",
    detail: "A modern retail and transport hub for dining, groceries, services, and onward journeys.",
  },
  {
    number: "03",
    name: "Bukit Panjang Plaza",
    detail: "A familiar town-centre destination for everyday shopping, food, family time, and errands.",
  },
  {
    number: "04",
    name: "Park connectors",
    detail: "Follow the green network around Zhenghua and Pang Sua for walks, rides, and open-air resets.",
  },
];

const reasons = [
  ["Green by default", "Nature trails and park connectors make fresh air part of the daily routine."],
  ["Connected living", "Stay close to transport links, schools, shops, and the wider north-west."],
  ["Room to grow", "A considered setting for first homes, growing families, and long-term value."],
];

type DirectoryOption = { name: string; location: string; detail: string; source: string; phone?: string };

function SearchableOptions({ kind, title, intro, placeholder, options }: {
  kind: string;
  title: string;
  intro: string;
  placeholder: string;
  options: DirectoryOption[];
}) {
  const [query, setQuery] = useState("");
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = options.filter((option) => {
    const text = `${option.name} ${option.location} ${option.detail} ${option.phone ?? ""}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });

  return (
    <section className={`${styles.areaSection} ${styles.foodSection}`} id={`${kind}-options`} aria-labelledby={`${kind}-heading`}>
      <h2 id={`${kind}-heading`}>{title}</h2>
      <p className={styles.foodIntro}>{intro}</p>
      <div className={styles.searchPanel}>
      <label className={styles.searchLabel} htmlFor={`${kind}-search`}>Search {title.toLowerCase()}</label>
      <div className={styles.searchBar}>
        <input id={`${kind}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-controls={`${kind}-results`} aria-describedby={`${kind}-search-hint`} />
        {query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}
      </div>
      <p className={styles.searchHint} id={`${kind}-search-hint`}>Search by name, description, or location. Results update as you type.</p>
      </div>
      <p className={styles.resultCount} role="status">{matches.length} of {options.length} places</p>
      <ul className={styles.foodList} id={`${kind}-results`}>
        {matches.map((option) => (
          <li className={styles.foodRow} key={option.source}>
            <div>
              <h3>{option.name}</h3>
              <p>{option.location}</p>
              <p>{option.detail}</p>
              {option.phone && <p><a href={`tel:${option.phone.replace(/\s/g, "")}`}>Call {option.phone}</a></p>}
            </div>
            <a className={styles.foodSource} href={option.source} target="_blank" rel="noopener noreferrer" aria-label={`View listing for ${option.name} (opens in a new tab)`}>
              View listing <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
      {matches.length === 0 && <p className={styles.foodIntro}>No matching places. Try another name, description, or location.</p>}
    </section>
  );
}

function FoodOptions() {
  return <SearchableOptions kind="food" title="Food options" intro="Places in Segar and nearby Fajar, with links to their online listings." placeholder="Try cakes, biryani, or Fajar" options={foodOptions} />;
}

function MedicalOptions() {
  return <SearchableOptions kind="medical" title="Medical options" intro="Family clinics around Segar, Fajar, and Senja. Check the clinic listing or call for current hours and appointments." placeholder="Try Segar, Fajar, or family clinic" options={medicalOptions} />;
}

export default function SegarPage() {
  return (
    <div className={styles.page} data-segar-theme="dark">
    <main>
      <div className={styles.topbar}>
        <a className={styles.logo} href="#top" aria-label="Segar Living home">
          segar<span>.</span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <ThemeToggle />
          <a href="#the-area">The area</a>
          <a href="#food-options">Food options</a>
          <a href="#medical-options">Medical options</a>
          <a href="#why-segar">Why Segar</a>
          <a className={styles.navCta} href="#food-options">
            Find food <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>

      <section className={styles.hero} id="top">
        <p className={styles.eyebrow}>Bukit Panjang · Singapore</p>
        <h1>Segar</h1>
        <p className={styles.lede}>Food and everyday places around the neighbourhood.</p>
      </section>

      <FoodOptions />
      <MedicalOptions />

      <section className={styles.introBand} id="discover">
        <p className={styles.sectionIndex}>A better everyday</p>
        <div>
          <h2>Property with a little more life around it.</h2>
          <p>
            Segar puts the things that matter within reach: leafy paths for a
            walk after dinner, useful places for the weekly shop, and homes that
            give you space to settle in and stay awhile.
          </p>
        </div>
      </section>

      <section className={styles.areaSection} id="the-area">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Around Segar</p>
            <h2>Small journeys,<br />well spent.</h2>
          </div>
          <p>Explore the places that shape the neighborhood, from nature reserves to convenient local gathering points.</p>
        </div>
        <div className={styles.neighbourhoodGrid}>
          {neighbourhoods.map((place) => (
            <article className={styles.neighbourhoodCard} key={place.number}>
              <span className={styles.cardNumber}>{place.number}</span>
              <div>
                <h3>{place.name}</h3>
                <p>{place.detail}</p>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.connectedSection}>
        <div className={styles.connectedIntro}>
          <p className={styles.eyebrow}>The north-west advantage</p>
          <h2>A calm base with the city still in reach.</h2>
        </div>
        <div className={styles.connectedGrid}>
          <article>
            <span>01 · Move</span>
            <h3>MRT, LRT, and bus links</h3>
            <p>Use Bukit Panjang&apos;s integrated transport network to move between home, work, school, and the rest of Singapore.</p>
          </article>
          <article>
            <span>02 · Gather</span>
            <h3>Town-centre convenience</h3>
            <p>Hillion Mall and Bukit Panjang Plaza bring dining, retail, services, and everyday errands close to the neighborhood.</p>
          </article>
          <article>
            <span>03 · Breathe</span>
            <h3>Green routes nearby</h3>
            <p>Step out for a walk or cycle through the park connector network and the leafy spaces around Zhenghua.</p>
          </article>
        </div>
      </section>

      <section className={styles.whySection} id="why-segar">
        <div className={styles.whyVisual}>
          <div className={styles.stamp}>SGR<br /><span>生活</span></div>
          <p>Make room<br />for what matters.</p>
        </div>
        <div className={styles.whyContent}>
          <p className={styles.eyebrow}>The Segar feeling</p>
          <h2>More than an address.</h2>
          <div className={styles.reasonList}>
            {reasons.map(([title, description], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <p className={styles.eyebrow}>Find your place in Segar</p>
        <h2>Start with a neighborhood.<br />Stay for the feeling.</h2>
        <a className={styles.primaryButton} href="mailto:hello@segar.sg">
          Talk to the Segar team <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <span className={styles.logo}>segar<span>.</span></span>
        <span>Living, naturally.</span>
        <span>Singapore · 2026</span>
      </footer>
    </main>
    </div>
  );
}
