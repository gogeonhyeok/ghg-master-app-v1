import styles from "./netflix.module.css";

type ThesisPoint = {
  number: string;
  title: string;
  text: string;
};

const thesisPoints: ThesisPoint[] = [
  {
    number: "01",
    title: "AI-native stories",
    text: "The most interesting opportunity is not simply using AI to make production cheaper. Netflix could develop interactive, personalized, or continuously evolving drama formats that are difficult for traditional studios to launch quickly.",
  },
  {
    number: "02",
    title: "A distribution advantage",
    text: "Netflix already has a direct relationship with a large global audience. If an AI-assisted format works, the company can test it with viewers, learn from engagement, and distribute it across markets without relying on cinemas or third-party broadcasters.",
  },
  {
    number: "03",
    title: "The recommendation flywheel",
    text: "A stronger understanding of what each viewer wants could improve discovery, retention, and the value of each hour watched. The potential advantage comes from connecting content creation, recommendation, and distribution in one product.",
  },
  {
    number: "04",
    title: "Global creative scale",
    text: "AI translation, dubbing, localization, pre-visualization, and production tools could help more stories travel across borders. Netflix may be able to turn local ideas into global releases faster than older studio systems.",
  },
];

const signals = [
  "A large streaming audience creates a natural testing environment.",
  "First-party viewing behavior can inform product and content experiments.",
  "AI could reduce friction in dubbing, localization, and production planning.",
  "Interactive or personalized drama could create new reasons to stay subscribed.",
  "A successful AI-native format might become a repeatable franchise engine.",
];

const risks = [
  "AI-generated content may feel generic, lowering trust and emotional attachment.",
  "Talent rights, training data, likeness, copyright, and disclosure rules remain uncertain.",
  "Competitors can license similar models, tools, and content quickly.",
  "Lower production costs do not guarantee better stories or stronger retention.",
  "Subscriber growth, pricing power, advertising, and content spending still matter more than a compelling AI narrative.",
];

export default function NetflixPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}><span className={styles.mark}>N</span><span>Personal research note / NFLX</span></div>
        <div className={styles.headerGrid}>
          <div>
            <p className={styles.eyebrow}>Investment thesis, not advice</p>
            <h1>Netflix in the<br /><em>AI era.</em></h1>
            <p className={styles.lede}>My view: Netflix could become one of the first major entertainment platforms to make AI-native drama and movies feel like a mainstream consumer product.</p>
          </div>
          <aside className={styles.thesisBadge}><span>Core idea</span><strong>Content + AI + distribution</strong><p>The upside is not just cheaper production. It is a new storytelling product.</p></aside>
        </div>
      </header>

      <section className={styles.thesisSection} aria-labelledby="thesis-title">
        <div className={styles.sectionRail}><span>01</span><p>The thesis</p></div>
        <div><h2 id="thesis-title">Why Netflix could be<br /><em>an early mover.</em></h2><p className={styles.sectionIntro}>This is a forward-looking hypothesis. The important question is whether Netflix can turn AI capability into stories people genuinely want to watch, not just into an impressive demo.</p><div className={styles.thesisGrid}>{thesisPoints.map((point) => <article key={point.number}><span>{point.number}</span><h3>{point.title}</h3><p>{point.text}</p></article>)}</div></div>
      </section>

      <section className={styles.compareSection} aria-labelledby="signals-title">
        <div className={styles.compareColumn}><p className={styles.eyebrow}>What I would watch</p><h2 id="signals-title">Signals for the<br /><em>bull case.</em></h2><ul>{signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></div>
        <div className={`${styles.compareColumn} ${styles.riskColumn}`}><p className={styles.eyebrow}>What could break it</p><h2>Reasons to<br /><em>stay humble.</em></h2><ul>{risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>
      </section>

      <section className={styles.watchSection} aria-labelledby="watch-title">
        <div className={styles.sectionRail}><span>02</span><p>Research checklist</p></div>
        <div><h2 id="watch-title">The idea needs<br /><em>evidence.</em></h2><div className={styles.checklist}><ChecklistItem label="Audience" text="Do viewers choose, finish, and recommend AI-assisted stories?" /><ChecklistItem label="Quality" text="Can the creative result feel authored, surprising, and emotionally specific?" /><ChecklistItem label="Economics" text="Does AI improve contribution margin without increasing churn or damaging the brand?" /><ChecklistItem label="Rights" text="Can Netflix build a durable rights and consent framework for creators?" /><ChecklistItem label="Product" text="Does the experience become a reason to subscribe, not merely a production footnote?" /></div></div>
      </section>

      <footer className={styles.footer}>
        <div><p className={styles.eyebrow}>Bottom line</p><h2>Potentially early.<br /><em>Definitely uncertain.</em></h2><p>This page records a personal thesis, not a buy or sell recommendation. Any investment decision should use current filings, earnings reports, valuation, competition, and your own risk tolerance.</p></div>
        <span className={styles.footerTag}>Research note / 2026</span>
      </footer>
    </main>
  );
}

function ChecklistItem({ label, text }: { label: string; text: string }) {
  return <div className={styles.checkItem}><strong>{label}</strong><p>{text}</p><span aria-hidden="true">+</span></div>;
}