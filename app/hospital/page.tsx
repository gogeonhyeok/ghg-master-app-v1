import type { Metadata } from "next";
import Link from "next/link";
import { coverage, filterKeys, hospitalUrl, sourceUrl, maxPage, parseHospitalQuery, type HospitalQuery } from "./catalog";
import { getHospitals } from "./data";
import HospitalFilters, { HiddenHospitalFilters } from "./HospitalFilters";
import Hospitals from "./Hospitals";
import DirectoryPagination from "../_components/DirectoryPagination";
import directory from "../_components/singapore-directory.module.css";
import styles from "./hospital.module.css";

export const metadata: Metadata = { title: "Singapore hospitals | Go Gun Hyuk", description: "Find Singapore public hospital names and addresses from the Government Directory." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const count = new Intl.NumberFormat("en-SG");

export default async function HospitalPage({ searchParams }: { searchParams: Promise<HospitalQuery> }) {
  const { page, size, filters, invalidFields } = parseHospitalQuery(await searchParams);
  const invalid = invalidFields.length > 0;
  const hasFilters = filterKeys.some(key => filters[key]);
  const data = invalid ? null : await getHospitals(page, size, filters).catch(() => null);
  const href = hospitalUrl(page, size, filters);
  return <div className={`${directory.page} ${styles.page}`}>
    <main className={directory.main}>
      <nav className={directory.breadcrumb} aria-label="Breadcrumb"><Link href="/">Workspace</Link><span>/</span><span>Hospitals</span></nav>
      <header className={directory.hero}>
        <div><p className={directory.eyebrow}>SINGAPORE / HOSPITALS</p><h1>Find a hospital<span>.</span></h1><p className={directory.intro}>Browse public hospital names and addresses across Singapore.</p></div>
        <div className={directory.registryMark}><span>SG</span><p>Public hospitals<br /><strong>Government Directory</strong></p></div>
      </header>
      <section className={directory.directory} aria-labelledby="hospital-heading">
        <header className={directory.toolbar}>
          <div><p className={directory.eyebrow}>EXPLORE / HOSPITAL DIRECTORY</p><h2 id="hospital-heading">Hospital directory</h2><p className={directory.description}>{data ? `${count.format(data.total)} ${hasFilters ? "matching public hospital entries" : "public hospital entries"} · Ordered by name` : "Search hospital locations and published details"}</p></div>
          <a className={directory.button} href={href}>Refresh ↻</a>
        </header>
        <HospitalFilters filters={filters} size={size} invalidFields={invalidFields} />
        <div className={directory.controls}>
          <p>Search names and addresses, or narrow your results with more filters.</p>
          <form action="/hospital" method="get" className={directory.pageSize} aria-label="Hospital page size">
            <input type="hidden" name="page" value="1" /><HiddenHospitalFilters filters={filters} />
            <label htmlFor="hospital-size">Per page</label><input id="hospital-size" name="size" type="number" min="1" max="100" step="1" required defaultValue={size} key={size} /><button type="submit">Apply</button>
          </form>
        </div>
        <p className={directory.coverage}>{data?.coverage || coverage}</p>
        {invalid ? <section className={directory.state}><h3>Check your search.</h3><p>Update the highlighted fields, then search again.</p></section> : !data ?
          <section className={directory.state} role="status"><span className={directory.stateIcon} aria-hidden="true">↻</span><h3>Hospital data is temporarily unavailable.</h3><p>The directory could not be loaded. Please try again in a moment.</p><a className={directory.button} href={href}>Try again</a></section> : <>
            {data.hospitals.length ? <Hospitals hospitals={data.hospitals} /> : <section className={directory.state} role="status"><h3>{data.total ? "No hospitals on this page." : hasFilters ? "No matching hospitals." : "No hospital records available."}</h3><p>{data.total ? "Return to the first page to continue browsing." : hasFilters ? "Try fewer filters or clear your search." : "Records will appear here when they are available from the source."}</p>{page > 1 && <Link className={directory.button} prefetch={false} href={hospitalUrl(1, size, filters)}>Return to page 1</Link>}</section>}
            <DirectoryPagination {...data} shown={data.hospitals.length} path="/hospital" parameter="q" filters={filters} label="Hospitals pagination" noun="hospital entries" />
            {data.total > 0 && <form action="/hospital" method="get" className={directory.jump} aria-label="Hospital page navigation">
              <input type="hidden" name="size" value={size} /><HiddenHospitalFilters filters={filters} />
              <label htmlFor="hospital-page">Go to page</label><input id="hospital-page" name="page" type="number" min="1" max={Math.min(maxPage, Math.max(1, Math.ceil(data.total / size)))} step="1" defaultValue={page <= Math.ceil(data.total / size) ? page : 1} key={href} required /><button type="submit">Go →</button>
            </form>}
          </>}
      </section>
      <footer className={directory.footer}>
        <p><a href={sourceUrl} target="_blank" rel="noopener noreferrer">Singapore Government Directory</a></p>
        {data && <p>Directory retrieved: <time dateTime={data.source.retrievedAt}>{new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" }).format(new Date(data.source.retrievedAt))}</time> · Cached for up to 24 hours.</p>}
      </footer>
    </main>
  </div>;
}
