# Singapore hawker centres

`/kopitiam` fetches the Lambda endpoint
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/kopitiam`
from the Next.js server. The fixed endpoint needs no browser CORS configuration.

The page lists NEA hawker centres from the data.gov.sg closure schedule dataset
`d_bda4baa634dd1cc7a6c7cad5f19e2d68`. Coverage excludes private coffeeshops and
food courts. Source status is not an indication of current opening hours.

Query parameters are `page` (1–1,000,000, default 1), `size` (1–100, default 25)
and optional `name`, for example `/kopitiam?name=Adam`. Invalid or repeated page
and size values use defaults. Names are trimmed and safely encoded for Lambda;
blank names are omitted. Repeated names or names longer than 256 characters show
a validation message without fetching. Search resets to page 1. Navigation,
page size, page jump, refresh and retry preserve the search; clearing preserves
the page size. Links disable prefetching to avoid extra Lambda calls.

The API returns `{ page, size, total, coverage, source, kopitiams }`. Each centre
has `id`, `name`, `address`, `type`, `latitude`, `longitude`, `foodStalls`,
`marketStalls`, `description`, `status`, and `photoUrl`. Type is `hawker-centre`;
coordinates, stall counts and the last three fields may be null. Responses are
validated, fetched without caching and limited to 25 seconds. Cards show stall
counts, address and source status, with Google Maps links when coordinates exist.
Photos are not rendered.

The page includes loading, unavailable, empty, no-match and out-of-range states.
Undeployed Lambda routes show a retry state. Internal errors are not rendered.
Shared search, pagination and styling live in `app/_components`; shared query
helpers live in `app/_lib/singapore-directory.ts`.

Run `npm test -- --runInBand --watchman=false app/companies app/kopitiam` for
fixture-based page and data tests without a deployed Lambda.
