import type { Metadata } from "next";
import Link from "next/link";
import { datasetUrl, kopitiamUrl, maxPage, parseKopitiamQuery, type KopitiamQuery } from "./catalog";
import { getKopitiams } from "./data";
import HawkerCentres from "./HawkerCentres";
import DirectorySearch from "../_components/DirectorySearch";
import DirectoryPagination from "../_components/DirectoryPagination";
import styles from "../_components/singapore-directory.module.css";

export const metadata: Metadata = { title: "Singapore hawker centres | Go Gun Hyuk", description: "Search NEA hawker centres in Singapore by name and browse addresses and stall counts." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const count = new Intl.NumberFormat("en-SG");

export default async function KopitiamPage({ searchParams }: { searchParams: Promise<KopitiamQuery> }) {
  const { page, size, name, invalidSearch } = parseKopitiamQuery(await searchParams);
  const data = invalidSearch ? null : await getKopitiams(page, size, name).catch(() => null);
  const href = kopitiamUrl(page, size, name);
  return (
    <div className={`${styles.page} ${styles.hawkerPage}`}>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Workspace</Link><span>/</span><span>Kopitiam</span></nav>
        <header className={styles.hero}>
          <div><p className={styles.eyebrow}>SINGAPORE / HAWKER CULTURE</p><h1>Find your next hawker stop<span>.</span></h1><p className={styles.intro}>Explore Singapore’s NEA hawker centres, from neighbourhood favourites to bigger markets.</p></div>
          <div className={styles.registryMark}><span>SG</span><p>Public places<br /><strong>NEA hawker centres</strong></p></div>
        </header>

        <section className={styles.directory} aria-labelledby="hawker-heading">
          <header className={styles.toolbar}>
            <div><p className={styles.eyebrow}>KOPITIAM / HAWKER CENTRES</p><h2 id="hawker-heading">Hawker centre directory</h2><p className={styles.description}>{data ? `${count.format(data.total)} ${name ? "matching centres" : "hawker centres"} · Ordered by name` : "Names, addresses and stall counts from NEA"}</p></div>
            <a className={styles.button} href={href}>Refresh ↻</a>
          </header>
          <DirectorySearch path="/kopitiam" parameter="name" search={name} size={size}
            label="Search hawker centre name" placeholder="e.g. Adam" invalid={invalidSearch} />
          <div className={styles.controls}>
            <p>Both small and large centres in NEA’s published dataset.</p>
            <form action="/kopitiam" method="get" className={styles.pageSize}>
              <input type="hidden" name="page" value="1" />
              {name && <input type="hidden" name="name" value={name} />}
              <label htmlFor="kopitiam-size">Per page</label><input id="kopitiam-size" name="size" type="number" min="1" max="100" step="1" required defaultValue={size} key={size} />
              <button type="submit">Apply</button>
            </form>
          </div>
          <p className={styles.coverage}>{data?.coverage || "NEA hawker centres in the published closure schedule; excludes private coffeeshops and food courts."} Source status does not indicate whether a centre is open right now.</p>

          {invalidSearch ? <section className={styles.state}><h3>Check your search.</h3><p>Update the hawker centre name above, then search again.</p></section> : !data ? <section className={styles.state} role="status"><span className={styles.stateIcon} aria-hidden="true">↻</span><h3>Hawker centre data is temporarily unavailable.</h3><p>The directory could not be loaded. Please try again in a moment.</p><a className={styles.button} href={href}>Try again</a></section> : <>
            {data.kopitiams.length ? <HawkerCentres centres={data.kopitiams} /> : <section className={styles.state} role="status"><h3>{data.total ? "No hawker centres on this page." : name ? "No matching hawker centres." : "No hawker centres available."}</h3><p>{data.total ? "Return to the first page to continue browsing." : name ? "Try another centre name or clear your search." : "Records will appear here when they are available from NEA."}</p>{page > 1 && <Link className={styles.button} prefetch={false} href={kopitiamUrl(1, size, name)}>Return to page 1</Link>}</section>}
            <DirectoryPagination {...data} shown={data.kopitiams.length} path="/kopitiam" parameter="name" search={name} label="Hawker centres pagination" noun="centres" />
            {data.total > 0 && <form action="/kopitiam" method="get" className={styles.jump}>
              <input type="hidden" name="size" value={size} />
              {name && <input type="hidden" name="name" value={name} />}
              <label htmlFor="kopitiam-page">Go to page</label><input id="kopitiam-page" name="page" type="number" min="1" max={Math.min(maxPage, Math.max(1, Math.ceil(data.total / size)))} step="1" defaultValue={page <= Math.ceil(data.total / size) ? page : 1} key={href} required /><button type="submit">Go →</button>
            </form>}
          </>}
        </section>
        <footer className={styles.footer}><p>Source: NEA via data.gov.sg. Stall counts and venue details may change.</p><a href={datasetUrl} target="_blank" rel="noopener noreferrer">About the dataset ↗</a></footer>
      </main>
    </div>
  );
}
