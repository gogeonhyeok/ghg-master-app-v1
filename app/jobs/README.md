# Singapore jobs

`/jobs` reads the [Greenhouse Job Board API](https://docs.greenhouse.io/job-board). GET endpoints are public and need no API key. No scraping, login, or paid provider is required.

The initial employer list is **Stripe, MongoDB, Cloudflare, and Datadog**. This is a selected employer feed, not a Singapore-wide index. Add verified Greenhouse board tokens to `catalog.ts` to extend coverage.

Each feed is fetched on the server with a 10-second timeout and cached for 15 minutes. A failed feed does not hide successful ones. The page reports partial or total failures, supports retry, and never substitutes sample jobs. Reloading within the cache window may return cached results.

Only postings whose location explicitly contains Singapore are included; worldwide/remote-only roles are excluded. IT matching and specialisms use title patterns in `catalog.ts`, so ambiguous titles can be missed. Multi-location postings are included when Singapore is explicitly listed. Past application deadlines are excluded when supplied. Sort uses the first publication date when available, otherwise the update date, and labels that distinction in the date column. Salary, seniority, and work arrangements are not inferred.

Search, specialism, company, sort, and pagination use URL parameters. Filters apply to all fetched eligible jobs before pagination, and changing filters starts at page 1. Job links go to the employer's original application page.

The **Remote part-time jobs** section uses the [Himalayas public search API](https://himalayas.app/api) without an API key or signup. It requests `country=SG`, `employment_type=Part Time`, and `sort=recent` across all industries. Its feed is independent of the IT employer feeds and filters. A table shows role, company, category, eligibility, pay with its original currency and period when supplied, last update date, and application link. Descriptions expand under each role. The table retains sticky headers and a keyboard-focusable, horizontally scrollable region on desktop and mobile. Application links preserve the provider's `applicationLink`, and the section visibly credits Himalayas.

Himalayas data refreshes daily, so each search page is server-cached for 24 hours with a 10-second request timeout. Expiry is rechecked when cached data is read. Only explicit Part Time roles whose country and timezone restrictions allow Singapore (UTC+8) are shown, including worldwide roles. The adapter accepts both live string/numeric restrictions and the object/string formats in the API schema. This is a remote-job feed, not an index of local retail or event shifts; individual listings may have in-person requirements.

`partTimePage` controls separate pagination and preserves applied IT query parameters. Per the provider's documentation, approximate `totalCount` and short pages do not establish the end of results: pagination continues until a raw search page is empty. Jobs are deduplicated within each page; a changing feed may repeat a role across pages. Empty and outage states remain distinct, and a Himalayas failure does not hide IT jobs (or vice versa). No sample jobs replace a failed feed. JobStreet and LinkedIn remain external links for broader local part-time searches.

Desktop uses a compact table with sticky column headers, row highlights, and a keyboard-focusable scroll region. At 640px and below, the same results appear as a compact list with tappable titles and expandable full locations/dates. Search stays visible, company/specialism filters collapse behind a button with an active count, and sorting sits beside the result count. Pagination and loading states adapt to both layouts. Page styling uses tag selectors scoped beneath the root class.

## Other providers researched

- [LinkedIn](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access): talent APIs require partner approval; open permissions do not include job search.
- [Glassdoor](https://www.glassdoor.com/crs/api/glassdoor-public-api-terms.pdf): published API terms refer to approved publisher sites; no verified self-serve job-search integration was available for this implementation.
- [Adzuna](https://developer.adzuna.com/overview): supports Singapore and an explicit part-time filter, but requires an app ID and key. It is not connected; Himalayas is used for the keyless part-time feed.
- [The Muse](https://www.themuse.com/developers/api/v2): public testing is documented, registration is required for ongoing use. The current endpoint returned 403 during verification; the legacy endpoint returned unrelated locations. It is not connected here.

LinkedIn, Glassdoor, JobStreet, and MyCareersFuture appear as external search links only.

## Validation

From `.nextjs`:

```sh
npm test -- --runInBand --watchman=false app/jobs
npx eslint app/jobs app/projects.ts
```
