import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Segar Living | Singapore",
  description:
    "Explore the everyday rhythm, green spaces, and property opportunities around Segar in Singapore.",
};

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

export default function SegarPage() {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <a className={styles.logo} href="#top" aria-label="Segar Living home">
          segar<span>.</span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#the-area">The area</a>
          <a href="#why-segar">Why Segar</a>
          <a className={styles.navCta} href="#discover">
            Discover homes <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Singapore · North West</p>
          <h1>Closer to green. Closer to home.</h1>
          <p className={styles.lede}>
            Welcome to Segar, a quietly connected neighborhood where everyday
            convenience meets the breathing room of Singapore&apos;s green belt.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#discover">
              Explore the neighborhood <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.textLink} href="#the-area">
              See what is nearby <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className={styles.heroVisual} aria-label="Aerial view of greenery and homes around Segar" role="img">
          <div className={styles.visualNote}>
            <span>Live in the rhythm of</span>
            <strong>everyday nature</strong>
          </div>
          <span className={styles.visualLabel}>1°23&apos;N · 103°46&apos;E</span>
        </div>
      </section>

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
  );
}