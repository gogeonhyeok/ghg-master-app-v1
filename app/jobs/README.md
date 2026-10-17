# Singapore IT jobs

`/jobs` reads the [Greenhouse Job Board API](https://docs.greenhouse.io/job-board). GET endpoints are public and need no API key. No scraping, login, or paid provider is required.

The initial employer list is **Stripe, MongoDB, Cloudflare, and Datadog**. This is a selected employer feed, not a Singapore-wide index. Add verified Greenhouse board tokens to `catalog.ts` to extend coverage.

Each feed is fetched on the server with a 10-second timeout and cached for 15 minutes. A failed feed does not hide successful ones. The page reports partial or total failures, supports retry, and never substitutes sample jobs. Reloading within the cache window may return cached results.

Only postings whose location explicitly contains Singapore are included; worldwide/remote-only roles are excluded. IT matching and specialisms use title patterns in `catalog.ts`, so ambiguous titles can be missed. Multi-location postings are included when Singapore is explicitly listed. Past application deadlines are excluded when supplied. Sort uses the first publication date when available, otherwise the update date, and labels that distinction in the date column. Salary, seniority, and work arrangements are not inferred.

Search, specialism, company, sort, and pagination use URL parameters. Filters apply to all fetched eligible jobs before pagination, and changing filters starts at page 1. Job links go to the employer's original application page.

Desktop uses a compact table with sticky column headers, row highlights, and a keyboard-focusable scroll region. At 640px and below, the same results appear as a compact list with tappable titles and expandable full locations/dates. Search stays visible, company/specialism filters collapse behind a button with an active count, and sorting sits beside the result count. Pagination and loading states adapt to both layouts. Page styling uses tag selectors scoped beneath the root class.

## Other providers researched

- [LinkedIn](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access): talent APIs require partner approval; open permissions do not include job search.
- [Glassdoor](https://www.glassdoor.com/crs/api/glassdoor-public-api-terms.pdf): published API terms refer to approved publisher sites; no verified self-serve job-search integration was available for this implementation.
- [Adzuna](https://developer.adzuna.com/overview): an option for wider coverage with an app ID and key. Its [API specification](https://developer.adzuna.com/swagger/spec/test2.json) supports `sg` and `it-jobs`. It is not connected here.
- [The Muse](https://www.themuse.com/developers/api/v2): public testing is documented, registration is required for ongoing use. The current endpoint returned 403 during verification; the legacy endpoint returned unrelated locations. It is not connected here.

LinkedIn, Glassdoor, JobStreet, and MyCareersFuture appear as external search links only.

## Validation

From this app's root:

```sh
npm run build
```

The copied `*.test.ts(x)` files use Jest and Testing Library, matching the source implementation in `glossaries/.nextjs/app/jobs`. This app currently has no Jest test script or installed Jest/Testing Library dependencies; its other existing test files have the same requirement. Test tooling was not added as part of this copy.
