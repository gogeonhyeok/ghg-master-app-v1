import type { Metadata } from "next";
import Link from "next/link";
import { availablePages, cities, formatPrice, parseFilters, propertiesUrl, propertyArea, providers, type PropertiesQuery } from "./catalog";
import { getProperties } from "./data";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Property transactions | Go Gun Hyuk", description: "Explore reported property sales in Singapore, South Korea and Taiwan." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const number = new Intl.NumberFormat("en-SG");

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<PropertiesQuery> }) {
  const { filters, error } = parseFilters(await searchParams);
  const result = error ? null : await getProperties(filters);
  const data = result?.available ? result.data : null;
  const pages = data ? availablePages(data) : 1;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">← Workspace</Link><span>/</span><span>Properties</span></nav>
        <header className={styles.hero}>
          <div><p className={styles.eyebrow}>ASIA / PROPERTY RECORDS</p><h1>Property transactions<span>.</span></h1><p className={styles.intro}>A closer look at reported home sales across Singapore, South Korea and Taiwan.</p></div>
          <div className={styles.markets} aria-label="Included markets"><span>SG</span><span>KR</span><span>TW</span><small>Three markets.<br />One place to explore.</small></div>
        </header>

        <section className={styles.filters} aria-labelledby="filter-heading">
          <div className={styles.sectionHeading}><h2 id="filter-heading">Choose your scope</h2><span>All three markets are included</span></div>
          <form action="/properties" method="get">
            <div className={styles.fields}>
              <label>Transaction month<input name="month" type="month" defaultValue={filters.month} min="1000-01" max="2999-12" required /><small>Registration month for HDB</small></label>
              <label>HDB town<input name="town" defaultValue={filters.town} placeholder="All towns" maxLength={100} /><small>For example, ANG MO KIO</small></label>
              <label>Korean location<input name="koreaQuery" defaultValue={filters.koreaQuery} maxLength={90} required /><small>Enter a district or neighbourhood in Korean</small></label>
              <label>Taiwan city / county<select name="city" defaultValue={filters.city}>{cities.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select><small>Current publication batch</small></label>
              <label>Records per source<input name="size" type="number" min="1" max="100" step="1" defaultValue={Number.isFinite(filters.size) ? filters.size : 20} required /><small>Up to 100 from each market</small></label>
            </div>
            <div className={styles.formFooter}><p>Prices stay in their original currency: <strong>SGD · KRW · TWD</strong></p><div><Link href="/properties">Reset</Link><button type="submit">Load transactions <span aria-hidden="true">↗</span></button></div></div>
          </form>
        </section>

        {error && <section className={styles.notice} role="alert"><h2>Check your filters</h2><p>{error}</p><Link href="/properties">Reset filters →</Link></section>}
        {!error && result && !result.available && <section className={styles.notice} role="alert"><h2>Property data is temporarily unavailable.</h2><p>One of the sources could not be loaded. Try again in a moment; your filters are preserved.</p><a href={propertiesUrl(filters)}>Try again →</a></section>}

        {data && <>
          <section className={styles.sources} aria-label="Source coverage">
            {data.sources.map((source) => {
              const market = providers[source.id];
              return <article key={source.id} className={styles.source}>
                <div className={styles.sourceTop}><span className={styles.countryCode}>{market.code}</span><span className={styles.loaded}>Loaded</span></div>
                <h2>{market.name}</h2><p className={styles.sourceType}>{market.type} <span>· {market.currency}</span></p>
                <p className={styles.sourceCount}>{number.format(source.total)}<span>matching records</span></p>
                <p className={styles.sourceDetail}>{source.returned} shown on this page{source.resolvedLocation ? ` · ${source.resolvedLocation}` : ""}</p>
                {source.truncated && <p className={styles.coverageNote}>Only the newest {number.format(source.available ?? 500)} matches are available to browse.</p>}
                {!!source.missingMonths?.length && <p className={styles.coverageNote}>Collection gaps: {source.missingMonths.join(", ")}. Results may be incomplete.</p>}
                {source.resolvedNote && <p className={styles.coverageNote}>{source.resolvedNote}</p>}
                <details className={styles.coverage}><summary>Coverage & source</summary><p>{source.coverage}</p><p>{source.source}</p><a href={market.href} target="_blank" rel="noopener noreferrer">Visit source ↗</a></details>
              </article>;
            })}
          </section>

          <section className={styles.transactions} aria-labelledby="transactions-heading">
            <div className={styles.resultsHeading}><div><p className={styles.eyebrow}>{filters.month} / REPORTED SALES</p><h2 id="transactions-heading">Transaction records</h2><p>{number.format(data.returned)} shown · {number.format(data.total)} matching records across the three sources</p></div><a href={propertiesUrl(filters)}>Refresh ↻</a></div>
            <p className={styles.explanation}>Each source is paginated separately. Records appear in source order; currency conversion and price ranking have not been applied.</p>
            {data.items.length ? <div className={styles.tableScroll} role="region" aria-label="Property transaction results" tabIndex={0}>
              <table className={styles.table}><caption>Property sales in Singapore, South Korea and Taiwan for {filters.month}</caption>
                <thead><tr><th scope="col">Property / address</th><th scope="col">Market</th><th scope="col">Sale price</th><th scope="col">Transaction date</th><th scope="col">Area</th><th scope="col">Original record</th></tr></thead>
                <tbody>{data.items.map((item, index) => <tr key={`${item.provider}-${item.date}-${index}`}>
                  <th scope="row"><span className={styles.address}>{item.address}</span><span className={styles.propertyType}>{providers[item.provider].type}{typeof item.sourceData.flat_type === "string" ? ` · ${item.sourceData.flat_type}` : ""}</span></th>
                  <td><span className={styles.marketTag}>{item.country}</span></td><td className={styles.price}>{formatPrice(item)}</td>
                  <td className={styles.date}><time dateTime={item.date}>{item.date}</time></td><td className={styles.area}>{propertyArea(item)}</td>
                  <td><details className={styles.record}><summary>View record</summary><dl>{Object.entries(item.sourceData).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value === null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl></details></td>
                </tr>)}</tbody>
              </table>
            </div> : <div className={styles.empty}><h3>No transactions on this page.</h3><p>Try another month or location. Taiwan covers its current publication batch, and a source may have no matches for the selected month.</p>{filters.page > 1 && <Link href={propertiesUrl(filters, 1)}>Return to page 1 →</Link>}</div>}
            <nav className={styles.pagination} aria-label="Property pagination">
              <span>Page {data.page}{data.page <= pages ? ` of ${number.format(pages)}` : ""} · Up to {filters.size} records per source</span><div>
                {data.page > 1 ? <Link prefetch={false} href={propertiesUrl(filters, data.page - 1)}>← Previous</Link> : <span aria-disabled="true">← Previous</span>}
                {data.page < pages ? <Link prefetch={false} href={propertiesUrl(filters, data.page + 1)}>Next →</Link> : <span aria-disabled="true">Next →</span>}
              </div>
            </nav>
          </section>
        </>}
        <footer className={styles.footer}><span>Reported sale transactions · Prices may be corrected by their source</span><span>SGD / KRW / TWD</span></footer>
      </main>
    </div>
  );
}
