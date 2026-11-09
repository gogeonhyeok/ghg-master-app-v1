# Singapore public hospitals

`/hospital` calls the hospital Lambda endpoint from the server. The API reads
public hospital names and addresses from the [Singapore Government Directory](https://www.sgdi.gov.sg/other-organisations/hospitals).
Some source entries group hospitals together; private hospitals are excluded.
The API and this page must be deployed together because the old OSM response
contract has been replaced.

For local development:

```sh
SINGAPORE_HOSPITAL_API_URL=http://localhost:8080/singapore/hospital npm run dev
```

Search supports `q` (name or address), `name` and `address`, with all supplied
filters combined before pagination. Each trimmed field is limited to 256
characters and must appear once. Page and size controls preserve the filters.
Each card shows the hospital name, address and official directory entry link.

The server validates the simplified JSON contract, government source URLs,
retrieval date, page bounds and unique directory IDs. Next.js fetches without
caching and uses a 25-second deadline. The API caches complete directory results
for 24 hours; its retrieval time is displayed without claiming a source update
time. Source errors and invalid query parameters have separate page states.

```sh
npm test -- --runInBand --watchman=false app/hospital
npx tsc --noEmit
```
