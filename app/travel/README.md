# Travel

`/travel` combines the Korea, Taiwan, and Singapore guides. Country navigation
uses the `destination` search parameter, for example `/travel?destination=taiwan`.
The default country is Korea. Missing or unknown selections fall back to Korea;
when the parameter is repeated, the first value is used.

Country data, the shared destination view, theme controls, styles, and tests live
in this directory. The selected country determines the metadata and color
palette. The shared `travel-theme` preference continues across destinations.

The old `/korea`, `/taiwan`, and `/singapore` URLs redirect to their corresponding
guides under `/travel` through `next.config.js`.

Run the travel checks from the app root:

```sh
npm test -- --runInBand --watchman=false app/travel
```
