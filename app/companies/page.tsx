import type { Metadata } from "next";
import Link from "next/link";
import { companiesUrl, maxPage, parseCompaniesQuery, type CompaniesQuery } from "./catalog";
import { getCompanies } from "./data";
import CompaniesTable from "./CompaniesTable";
import CompaniesPagination from "./CompaniesPagination";
import DirectorySearch from "../_components/DirectorySearch";
import styles from "../_components/singapore-directory.module.css";

export const metadata: Metadata = { title: "Singapore companies | Go Gun Hyuk", description: "Browse registered local companies in Singapore using ACRA's public company records." };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const count = new Intl.NumberFormat("en-SG");

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<CompaniesQuery> }) {
  const { page, size, entityName, invalidSearch } = parseCompaniesQuery(await searchParams);
  const data = invalidSearch ? null : await getCompanies(page, size, entityName).catch(() => null);
  const href = companiesUrl(page, size, entityName);
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Workspace</Link><span>/</span><span>Companies</span></nav>
        <header className={styles.hero}>
          <div><p className={styles.eyebrow}>SINGAPORE / BUSINESS DIRECTORY</p><h1>Singapore companies<span>.</span></h1><p className={styles.intro}>Explore the local companies registered in Singapore, one page at a time.</p></div>
          <div className={styles.registryMark}><span>SG</span><p>Public records<br /><strong>ACRA registry</strong></p></div>
        </header>

        <section className={styles.directory} aria-labelledby="directory-heading">
          <header className={styles.toolbar}>
            <div><p className={styles.eyebrow}>REGISTERED LOCAL COMPANIES</p><h2 id="directory-heading">Company directory</h2><p className={styles.description}>{data ? `${count.format(data.total)} ${entityName ? "matching companies" : "companies"} · Ordered by UEN` : "Company names, registration details and addresses"}</p></div>
            <a className={styles.button} href={href}>Refresh ↻</a>
          </header>
          <DirectorySearch path="/companies" parameter="entity_name" search={entityName} size={size}
            label="Search company name" placeholder="e.g. DBS" invalid={invalidSearch} />
          <div className={styles.controls}>
            <p>Registered local companies only. Updated monthly by ACRA.</p>
            <form action="/companies" method="get" className={styles.pageSize}>
              <input type="hidden" name="page" value="1" />
              {entityName && <input type="hidden" name="entity_name" value={entityName} />}
              <label htmlFor="companies-size">Per page</label><input id="companies-size" name="size" type="number" min="1" max="100" step="1" required defaultValue={size} key={size} />
              <button type="submit">Apply</button>
            </form>
          </div>

          {invalidSearch ? <section className={styles.state}><h3>Check your search.</h3><p>Update the company name above, then search again.</p></section> : !data ? <section className={styles.state} role="status"><span className={styles.stateIcon} aria-hidden="true">↻</span><h3>Company data is temporarily unavailable.</h3><p>The directory could not be loaded. Please try again in a moment.</p><a className={styles.button} href={href}>Try again</a></section> : <>
            {data.companies.length ? <CompaniesTable companies={data.companies} /> : <section className={styles.state} role="status"><h3>{data.total ? "No companies on this page." : entityName ? "No matching companies." : "No companies available."}</h3><p>{data.total ? "Return to the first page to continue browsing the directory." : entityName ? "Try another company name or clear your search." : "Records will appear here when they are available from the registry."}</p>{page > 1 && <Link className={styles.button} prefetch={false} href={companiesUrl(1, size, entityName)}>Return to page 1</Link>}</section>}
            <CompaniesPagination data={data} entityName={entityName} />
            {data.total > 0 && <form action="/companies" method="get" className={styles.jump}>
              <input type="hidden" name="size" value={size} />
              {entityName && <input type="hidden" name="entity_name" value={entityName} />}
              <label htmlFor="companies-page">Go to page</label><input id="companies-page" name="page" type="number" min="1" max={Math.min(maxPage, Math.max(1, Math.ceil(data.total / size)))} step="1" defaultValue={page <= Math.ceil(data.total / size) ? page : 1} key={href} required /><button type="submit">Go →</button>
            </form>}
          </>}
        </section>
        <footer className={styles.footer}><p>Source: ACRA via data.gov.sg. Monthly publication; registration details may change.</p><a href="https://data.gov.sg/datasets/d_3f960c10fed6145404ca7b821f263b87/view" target="_blank" rel="noopener noreferrer">About the dataset ↗</a></footer>
      </main>
    </div>
  );
}
