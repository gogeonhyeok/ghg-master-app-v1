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

Prices remain in SGD, KRW and TWD. Conversion and global price ranking are
deferred. Taiwan covers its current publication batch; an empty month is valid.
An upstream failure produces an unavailable state with a retry link, rather
than an empty transaction table. Invalid or inconsistent responses are rejected.

```sh
npm test -- --runInBand --watchman=false app/properties
```

Tests use synthetic responses and mocked `fetch`; they make no network calls.
