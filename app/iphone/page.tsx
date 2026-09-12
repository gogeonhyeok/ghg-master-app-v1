import styles from "./iphone.module.css";

type IphoneYear = {
  year: number;
  models: string[];
  note: string;
};

const iphoneYears: IphoneYear[] = [
  { year: 2007, models: ["iPhone"], note: "The original iPhone" },
  { year: 2008, models: ["iPhone 3G"], note: "App Store era begins" },
  { year: 2009, models: ["iPhone 3GS"], note: "Speed and video upgrade" },
  { year: 2010, models: ["iPhone 4"], note: "Retina display arrives" },
  { year: 2011, models: ["iPhone 4S"], note: "Siri joins the lineup" },
  { year: 2012, models: ["iPhone 5"], note: "A taller display and Lightning" },
  { year: 2013, models: ["iPhone 5c", "iPhone 5s"], note: "Color and Touch ID" },
  { year: 2014, models: ["iPhone 6", "iPhone 6 Plus"], note: "The first large-screen iPhones" },
  { year: 2015, models: ["iPhone 6s", "iPhone 6s Plus"], note: "3D Touch and Live Photos" },
  { year: 2016, models: ["iPhone SE (1st generation)", "iPhone 7", "iPhone 7 Plus"], note: "Compact classic and dual cameras" },
  { year: 2017, models: ["iPhone 8", "iPhone 8 Plus", "iPhone X"], note: "Ten years of iPhone" },
  { year: 2018, models: ["iPhone XS", "iPhone XS Max", "iPhone XR"], note: "The X design expands" },
  { year: 2019, models: ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"], note: "Night mode and Pro cameras" },
  { year: 2020, models: ["iPhone SE (2nd generation)", "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max"], note: "5G and MagSafe" },
  { year: 2021, models: ["iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max"], note: "Cinematic mode arrives" },
  { year: 2022, models: ["iPhone SE (3rd generation)", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"], note: "Dynamic Island and satellite SOS" },
  { year: 2023, models: ["iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"], note: "USB-C and titanium Pro models" },
  { year: 2024, models: ["iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 16e"], note: "Apple Intelligence enters the lineup" },
  { year: 2025, models: ["iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max"], note: "The 17 family" },
  { year: 2026, models: ["iPhone 17e"], note: "The latest compact entry" },
];

const modelCount = iphoneYears.reduce((total, entry) => total + entry.models.length, 0);

export default function IphonePage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Apple / Product history</p>
          <h1>Every iPhone,<br /><em>year by year.</em></h1>
          <p className={styles.intro}>
            A chronological guide to Apple&apos;s iPhone lineup, from the original 2007 model through 2026.
          </p>
        </div>
        <div className={styles.summary} aria-label="Catalog summary">
          <strong>{modelCount}</strong>
          <span>models catalogued</span>
          <div className={styles.summaryLine} />
          <strong>{iphoneYears.length}</strong>
          <span>launch years</span>
        </div>
      </header>

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>The catalog</p>
          <h2 id="catalog-title">The full timeline</h2>
        </div>
        <div className={styles.timeline}>
          {iphoneYears.map((entry) => (
            <article className={styles.year} key={entry.year}>
              <div className={styles.yearMarker} aria-hidden="true" />
              <p className={styles.yearNumber}>{entry.year}</p>
              <div className={styles.yearContent}>
                <div className={styles.yearTitle}>
                  <h3>{entry.models.length === 1 ? entry.models[0] : `${entry.models.length} models`}</h3>
                  <p>{entry.note}</p>
                </div>
                <ul>
                  {entry.models.map((model) => <li key={model}>{model}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>Catalogued through 2026 <span>•</span> Apple iPhone history</footer>
    </main>
  );
}