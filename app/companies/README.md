# Singapore companies

`/companies` reads the Lambda endpoint
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/companies`
from the Next.js server. No browser-to-Lambda requests or CORS configuration are
needed. The URL is fixed in `data.ts`.

The page accepts `page` (1–1,000,000, default 1), `size` (1–100, default 25),
and optional `entity_name` (for example, `/companies?entity_name=DBS`). Invalid
or repeated pagination values use the defaults. Names are trimmed and forwarded
as the Lambda's `entity_name` parameter using URL encoding. Blank names list all
companies; repeated names and names longer than 256 characters show a validation
message without fetching. Matching follows the upstream field search semantics.

Search and page size changes reset to page 1. Previous/next links, page jumps,
page size changes, refresh and retry preserve the search. Clear search keeps the
page size and returns to page 1.
Link prefetching is disabled to avoid unnecessary Lambda requests.

The expected API response is `{ page, size, total, companies }`. Each company has
`uen`, `name`, `status`, `entityType`, `registrationDate`, `streetName` and
`postalCode`. The last three fields may be null. Postal codes stay strings.
The response is validated before rendering and fetched without caching, with a
25-second timeout. The directory includes registered local companies only.

Until the Lambda route is deployed, the page shows an unavailable state with a
retry link. It also handles service errors, timeouts, malformed data and empty
pages without showing fabricated records or internal error details.

Run `npm test -- --runInBand --watchman=false app/companies` for fixture-based
data and page tests; these do not require a deployed Lambda.
