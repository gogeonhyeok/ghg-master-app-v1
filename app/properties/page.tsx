import type { Metadata } from "next";
import Link from "next/link";
import { availablePages, cities, parseFilters, propertiesUrl, providers, type PropertiesQuery } from "./catalog";
import { getProperties } from "./data";
import { getUsdRates } from "./exchange";
import Transactions from "./Transactions";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Property transactions | Go Gun Hyuk", description: "Explore reported property sales in Singapore, South Korea and Taiwan." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const number = new Intl.NumberFormat("en-SG");

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<PropertiesQuery> }) {
  const { filters, error } = parseFilters(await searchParams);
  const [result, rates] = error ? [null, null] : await Promise.all([getProperties(filters), getUsdRates()]);
  const data = result?.available ? result.data : null;
  const pages = data ? availablePages(data) : 1;

  return (
    <div className={styles.page}>
      <main>
        <nav aria-label="Breadcrumb"><Link href="/">Workspace</Link><span>/</span><span>Properties</span></nav>
        <header>
          <div><p>ASIA / PROPERTY RECORDS</p><h1>Property transactions<span>.</span></h1><p>A closer look at reported home sales across Singapore, South Korea and Taiwan.</p></div>
          <div aria-label="Included markets"><span>SG</span><span>KR</span><span>TW</span><small>Three markets.<br />One place to explore.</small></div>
        </header>

        <section aria-labelledby="filter-heading">
          <header><h2 id="filter-heading">Choose your scope</h2><span>All three markets are included</span></header>
          <form action="/properties" method="get">
            <div>
              <label>Transaction month<input name="month" type="month" defaultValue={filters.month} min="1000-01" max="2999-12" required /><small>Registration month for HDB</small></label>
              <label>HDB town<input name="town" defaultValue={filters.town} placeholder="All towns" maxLength={100} /><small>For example, ANG MO KIO</small></label>
              <label>Korean location<input name="koreaQuery" defaultValue={filters.koreaQuery} maxLength={90} required /><small>Enter a district or neighbourhood in Korean</small></label>
              <label>Taiwan city / county<select name="city" defaultValue={filters.city}>{cities.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select><small>Current publication batch</small></label>
              <label>Records per source<input name="size" type="number" min="1" max="100" step="1" defaultValue={Number.isFinite(filters.size) ? filters.size : 20} required /><small>Up to 100 from each market</small></label>
            </div>
            <footer><p>Compare USD estimates alongside original prices: <strong>SGD · KRW · TWD</strong></p><div><Link href="/properties">Reset</Link><button type="submit">Load transactions</button></div></footer>
          </form>
        </section>

        {error && <section role="alert"><h2>Check your filters</h2><p>{error}</p><Link href="/properties">Reset filters</Link></section>}
        {!error && result && !result.available && <section role="alert"><h2>Property data is temporarily unavailable.</h2><p>One of the sources could not be loaded. Try again in a moment; your filters are preserved.</p><a href={propertiesUrl(filters)}>Try again</a></section>}

        {data && <>
          <section aria-label="Source coverage">
            {data.sources.map((source) => {
              const market = providers[source.id];
              return <article key={source.id}>
                <header><span>{market.code}</span><span>Loaded</span></header>
                <h2>{market.name}</h2><p>{market.type} <span>· {market.currency}</span></p>
                <p><strong>{number.format(source.total)}</strong><span>matching records</span></p>
                <p>{source.returned} shown on this page{source.resolvedLocation ? ` · ${source.resolvedLocation}` : ""}</p>
                {(source.truncated || !!source.missingMonths?.length || source.resolvedNote) && <aside>
                  {source.truncated && <p>Only the newest {number.format(source.available ?? 500)} matches are available to browse.</p>}
                  {!!source.missingMonths?.length && <p>Collection gaps: {source.missingMonths.join(", ")}. Results may be incomplete.</p>}
                  {source.resolvedNote && <p>{source.resolvedNote}</p>}
                </aside>}
                <details><summary>Coverage & source</summary><p>{source.coverage}</p><p>{source.source}</p><a href={market.href} target="_blank" rel="noopener noreferrer">Visit source</a></details>
              </article>;
            })}
          </section>

          <section aria-labelledby="transactions-heading">
            <header><div><p>{filters.month} / REPORTED SALES</p><h2 id="transactions-heading">Transaction records</h2><p>{number.format(data.returned)} shown · {number.format(data.total)} matching records across the three sources</p></div><a href={propertiesUrl(filters)}>Refresh</a></header>
            {data.items.length ? <Transactions key={propertiesUrl(filters)} items={data.items} month={filters.month} rates={rates} /> : <div role="status"><h3>No transactions on this page.</h3><p>Try another month or location. Taiwan covers its current publication batch, and a source may have no matches for the selected month.</p>{filters.page > 1 && <Link href={propertiesUrl(filters, 1)}>Return to page 1</Link>}</div>}
            <nav aria-label="Property pagination">
              <span>Page {data.page}{data.page <= pages ? ` of ${number.format(pages)}` : ""} · Up to {filters.size} records per source</span><div>
                {data.page > 1 ? <Link prefetch={false} href={propertiesUrl(filters, data.page - 1)}>Previous</Link> : <span aria-disabled="true">Previous</span>}
                {data.page < pages ? <Link prefetch={false} href={propertiesUrl(filters, data.page + 1)}>Next</Link> : <span aria-disabled="true">Next</span>}
              </div>
            </nav>
          </section>
        </>}
        <footer><span>Reported sale transactions · Prices may be corrected by their source</span><span>USD estimates from SGD / KRW / TWD</span></footer>
      </main>
    </div>
  );
}
