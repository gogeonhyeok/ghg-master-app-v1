import Link from "next/link";
import TravelTheme, { ThemeToggle } from "./TravelTheme";
import styles from "./travel.module.css";

export type DestinationData = {
  slug: string; name: string; local: string; tagline: string; intro: string; mood: string;
  placesTitle: string; places: [string, string, string][];
  foods: [string, string][]; experiences: [string, string][];
  itinerary: [string, string][]; source: string; sourceName: string;
};

export default function Destination({ data }: { data: DestinationData }) {
  return <TravelTheme destination={data.slug}><main>
    <header className={styles.topbar}><Link href={`/${data.slug}`} className={styles.brand}>elsewhere<span> / travel notes</span></Link><nav aria-label="Destinations">{["korea", "taiwan", "singapore"].map((slug) => <Link key={slug} href={`/${slug}`} aria-current={slug === data.slug ? "page" : undefined}>{slug}</Link>)}</nav><ThemeToggle /></header>
    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>A LITTLE CURIOSITY. A NEW DESTINATION.</p><h1>{data.name}<span>{data.local}</span></h1><h2>{data.tagline}</h2><p className={styles.intro}>{data.intro}</p><a className={styles.button} href="#places">Find your next stop <span aria-hidden="true">↗</span></a></div>
      <div className={styles.poster} aria-hidden="true"><div className={styles.sun} /><div className={styles.hill} /><div className={styles.hillTwo} /><span className={styles.posterTop}>LET THE EVERYDAY<br />FEEL FAR AWAY.</span><strong>{data.local}</strong><span className={styles.posterBottom}>{data.mood}<br />{data.name} / an invitation to explore</span></div>
    </section>
    <nav className={styles.sectionNav} aria-label="On this page"><a href="#places">01 / Places</a><a href="#food">02 / Food</a><a href="#experiences">03 / Experiences</a><a href="#itinerary">04 / A first trip</a></nav>
    <section className={styles.section} id="places"><div className={styles.heading}><div><p className={styles.eyebrow}>MAKE A LITTLE ROOM FOR DISCOVERY</p><h2>{data.placesTitle}</h2></div><p>Start with a landmark. Stay for the streets, flavours, and little moments around it.</p></div><div className={styles.places}>{data.places.map(([name, label, detail], index) => <article key={name} className={styles.place}><span className={styles.number}>0{index + 1}</span><p className={styles.label}>{label}</p><h3>{name}</h3><p>{detail}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + data.name)}`} aria-label={`Find ${name} on Google Maps`}>Explore on map ↗</a></article>)}</div></section>
    <section className={styles.foodBand} id="food"><div className={styles.foodIntro}><p className={styles.eyebrow}>FOLLOW YOUR APPETITE</p><h2>A place is also<br />a flavour.</h2><p>Make time for the first bite, the shared table, and the snack you go back for.</p></div><div className={styles.foodList}>{data.foods.map(([name, detail], index) => <article key={name}><span>0{index + 1}</span><div><h3>{name}</h3><p>{detail}</p></div></article>)}</div></section>
    <section className={styles.section} id="experiences"><div className={styles.heading}><div><p className={styles.eyebrow}>LESS CHECKLIST. MORE MEMORIES.</p><h2>Go do something<br />you’ll talk about.</h2></div></div><div className={styles.experiences}>{data.experiences.map(([name, detail]) => <article key={name}><span aria-hidden="true">✳</span><h3>{name}</h3><p>{detail}</p></article>)}</div></section>
    <section className={styles.itinerary} id="itinerary"><div><p className={styles.eyebrow}>A FIRST-TRIP STARTING POINT</p><h2>A few days.<br />A different rhythm.</h2><p>An editorial route to adapt to your own pace. Leave room between the highlights.</p></div><ol>{data.itinerary.map(([title, detail]) => <li key={title}><h3>{title}</h3><p>{detail}</p></li>)}</ol></section>
    <section className={styles.cta}><p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2>See where {data.name}<br />takes you.</h2><p>Explore official destination guides and check current opening hours, access, and travel information before you go.</p><a className={styles.button} href={data.source}>Explore {data.sourceName} ↗</a></section>
    <footer className={styles.footer}><span>elsewhere / {data.name}</span><span>Independent travel inspiration · <a href={data.source}>Official tourism guide</a></span></footer>
  </main></TravelTheme>;
}
