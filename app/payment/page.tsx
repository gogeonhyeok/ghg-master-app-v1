import { XMLParser } from "fast-xml-parser";
import PaymentWorkspace from "./PaymentWorkspace";

async function getStripePosts() {
  try {
    const response = await fetch("https://stripe.com/blog/feed.rss", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Feed unavailable");
    const rss = new XMLParser({ parseTagValue: false }).parse(await response.text());
    if (rss?.rss?.channel == null) throw new Error("Invalid RSS");
    const entries = rss.rss.channel.item;
    const items = (Array.isArray(entries) ? entries : entries ? [entries] : []).flatMap((entry: Record<string, unknown>) => {
      if (typeof entry?.title !== "string" || typeof entry.link !== "string") return [];
      try {
        const url = new URL(entry.link);
        if (url.protocol !== "https:" || url.hostname !== "stripe.com") return [];
      } catch { return []; }
      const description = typeof entry.description === "string" ? entry.description.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : "";
      const date = typeof entry.pubDate === "string" ? new Date(entry.pubDate) : null;
      return [{ title: entry.title, link: entry.link, description: description.length > 220 ? description.slice(0, 217) + "…" : description, date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null }];
    });
    return { items, unavailable: false };
  } catch {
    return { items: [], unavailable: true };
  }
}

export default async function PaymentPage() {
  const feed = await getStripePosts();
  return <PaymentWorkspace {...feed} />;
}
