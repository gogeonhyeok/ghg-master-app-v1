# Singapore hospitals

`/hospital` is a dynamic server-rendered Next.js App Router page that calls
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/singapore/hospital`.
Deploy the hospital Camel route in `ghg-master-api-v1` before using the default
URL. For a local backend, run:

```sh
SINGAPORE_HOSPITAL_API_URL=http://localhost:8080/singapore/hospital npm run dev
```

The browser does not call Lambda directly, so CORS configuration is unnecessary.
The search form supports `q`, `name`, `operator`, `speciality`, `street`,
`postal_code`, `emergency=yes|no`, and `wheelchair=yes|no|limited`. All filters
combine and remain in previous/next, refresh, retry, page-size and page-jump
navigation. Searches and page-size changes reset to page 1. Text fields are
trimmed and limited to 256 characters. Repeated or invalid search fields show
validation without fetching. Invalid pagination defaults to page 1 / size 25;
limits are page 1–1,000,000 and size 1–100, matching the other directories.

Hospital records show address, operator, specialty, emergency and wheelchair
tags, contacts and an OpenStreetMap link. Missing fields remain unknown.
Website links accept HTTP(S) only; phone links use a restricted telephone
format. OSM identities, source metadata, coordinates, pagination and duplicate
records are checked before rendering.

OpenStreetMap is community-maintained and is not an official licensed-hospital
directory. A hospital may have multiple map features; each remains a separate
record. Emergency tags and hours do not indicate live availability. The page
retains OpenStreetMap attribution and an ODbL link. Next.js uses an uncached
server fetch with a 25-second timeout; the backend caches source data for 15
minutes. Errors show a retry state without exposing upstream details.
`loading.tsx` provides the pending navigation state.

The route reuses directory styles and pagination. Its `app/projects.ts` entry
appears in the workspace and command palette.

```sh
npm test -- --runInBand --watchman=false app/hospital app/companies app/kopitiam components/CommandPalette.test.tsx
npx tsc --noEmit --incremental false
```
