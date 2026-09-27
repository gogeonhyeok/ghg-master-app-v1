import type { Metadata } from "next";
import Link from "next/link";
import { XMLParser } from "fast-xml-parser";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Apache Camel · Journal",
  description: "Releases, integration stories, and updates from the Apache Camel blog.",
};

const RSS_URL = "https://camel.apache.org/blog/index.xml";
const PAGE_SIZE = 8;
type RssItem = { title?: string; link?: string; pubDate?: string; description?: string };

function excerpt(value: unknown) {
  if (typeof value !== "string") return "";
  const text = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
}

function articleUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export default async function CamelPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  let items: RssItem[] = [];
  let unavailable = false;
  try {
    const response = await fetch(RSS_URL, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Feed unavailable");
    const rss = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(await response.text());
    if (rss?.rss?.channel == null) throw new Error("Invalid feed");
    const entries = rss.rss.channel.item;
    items = (Array.isArray(entries) ? entries : entries ? [entries] : [])
      .filter((item: RssItem) => item && typeof item.title === "string" && articleUrl(item.link));
  } catch { unavailable = true; }

  const rawPage = typeof params.page === "string" && /^\d+$/.test(params.page) ? Number(params.page) : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number.isSafeInteger(rawPage) ? rawPage : 1));
  const start = (page - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((number) => number === 1 || number === totalPages || Math.abs(number - page) <= 1);

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/camel"><span className={styles.mark} aria-hidden="true">C</span> Apache Camel <span className={styles.journal}>/ Journal</span></Link>
          <a className={styles.external} href="https://camel.apache.org/">Project website ↗</a>
        </header>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>THE INTEGRATION JOURNAL</p>
          <h1>Connect the dots.<br /><span>Stay in the loop.</span></h1>
          <p className={styles.intro}>Releases, ideas, and engineering stories from the Apache Camel community.</p>
          <a className={styles.feedLink} href={RSS_URL}>Subscribe via RSS <span aria-hidden="true">↗</span></a>
        </section>
        <section aria-labelledby="articles-heading" id="articles">
          <div className={styles.sectionHeading}>
            <h2 id="articles-heading">From the blog</h2>
            <p>{items.length ? `${start + 1}–${Math.min(start + PAGE_SIZE, items.length)} of ${items.length} articles` : "Apache Camel updates"}</p>
          </div>
          {unavailable ? <div className={styles.empty}><h3>The feed is temporarily unavailable.</h3><p>Please try again later, or <a href="https://camel.apache.org/blog/">read the Apache Camel blog ↗</a>.</p></div>
            : !items.length ? <div className={styles.empty}><h3>No articles yet.</h3><p>Check back for updates from the community.</p></div>
            : <div className={styles.articles}>{visible.map((item, index) => {
              const date = item.pubDate ? new Date(item.pubDate) : null;
              const validDate = date && !Number.isNaN(date.getTime());
              return <article className={styles.article} key={`${item.link}-${start + index}`}>
                <div className={styles.articleMeta}><span>COMMUNITY UPDATE</span>{validDate && <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time>}</div>
                <h3><a href={articleUrl(item.link)!}>{item.title}<span aria-hidden="true">↗</span></a></h3>
                {item.description && <p>{excerpt(item.description)}</p>}
              </article>;
            })}</div>}
          {totalPages > 1 && <nav className={styles.pagination} aria-label="Article pagination">
            {page > 1 ? <Link href={`/camel?page=${page - 1}#articles`}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
            <div className={styles.pageNumbers}>{pages.map((number, index) => <span className={styles.pageSlot} key={number}>
              {index > 0 && number - pages[index - 1] > 1 && <span className={styles.ellipsis}>…</span>}
              <Link aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined} href={`/camel?page=${number}#articles`}>{number}</Link>
            </span>)}</div>
            {page < totalPages ? <Link href={`/camel?page=${page + 1}#articles`}>Next →</Link> : <span aria-disabled="true">Next →</span>}
          </nav>}
        </section>
        <footer className={styles.footer}><span>Sourced from the official Apache Camel RSS feed.</span><span>Built around connection.</span></footer>
      </main>
    </div>
  );
}
