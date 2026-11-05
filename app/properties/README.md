# Property transactions

`/properties` renders Singapore HDB resale, Korean apartment sales and Taiwan
residential transactions from the deployed Lambda. Open
`/properties?month=2026-10` for the original example. With no month, the page
selects the last completed calendar month in Singapore time.

The server component fetches the Lambda directly with a 35-second timeout and
no caching. No browser CORS configuration or credentials are required. The
default endpoint is
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/properties`.
An optional server-only `PROPERTIES_API_URL` overrides the endpoint in deployment.
Only the six supported filter values are sent upstream; callers cannot select
the endpoint or forward arbitrary headers.

Filters: `month`, `town`, `koreaQuery`, `city`, `size` (1–100 per source), and
`page` (1–500). Changing filters resets pagination. Pagination follows the
largest accessible source and respects Korea's fetched-record cap. The page
shows source coverage, missing collection months, truncated results, and original
records. Area values retain each source's measurement definition.
Each property address opens a Google Maps search in a new tab, using the address
and country as the search query.

The CSS module uses one `.page` class on the page/loading wrapper. Descendants
use scoped element selectors and existing accessibility attributes, including
`:has()` to distinguish the filter, source and transaction sections. The
transaction component has no styling classes or stylesheet import.

Original prices remain in SGD, KRW and TWD. The page also fetches latest available
USD reference rates from [Frankfurter](https://frankfurter.dev/) without an API
key. One request covers all three currencies, with a 10-second timeout and
hourly caching. USD estimates divide each local price by its currency's rate
per USD; rounding to two decimals happens only for display. The rate details
show the date for each currency. These are current reference rates, rather
than historical transaction-date rates.

Loaded records default to USD low-to-high order. The sort control also offers
USD high-to-low and source order without refetching. Sorting covers only the
current page of records from the three sources, rather than all matching
transactions. If rates fail validation or cannot be loaded, local prices stay
visible and USD sorting is disabled. Refresh the page to retry.

Taiwan covers its current publication batch; an empty month is valid.
An upstream failure produces an unavailable state with a retry link, rather
than an empty transaction table. Invalid or inconsistent responses are rejected.

```sh
npm test -- --runInBand --watchman=false app/properties
```

Tests use synthetic responses and mocked `fetch`; they make no network calls.
