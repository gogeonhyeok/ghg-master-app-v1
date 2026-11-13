# Kamponglah

Visit `/kamponglah`. Complaints, comments, votes and theme preferences use the deployed Camel API at `https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/kamponglah`. Camel owns MongoDB access to **`ghg-master-app-v1`**. Kamponglah does not connect to MongoDB from Next.js or use a Next.js API route.

## Server configuration

Set `KAMPONGLAH_IDENTITY_SECRET` in the app server environment to the **same** strong random key of at least 32 UTF-8 bytes stored in AWS Secrets Manager as the plain-text secret `kamponglah.identity-secret`. The API's SAM template resolves that secret into Lambda's environment during the existing GitHub Actions deployment. Its OIDC deployment role needs `secretsmanager:GetSecretValue` on that secret. No copy of the identity key is needed in GitHub Actions secrets. Keep it server-only; do not prefix it with `NEXT_PUBLIC_`, commit it, or send it to the browser. Restart/redeploy the affected service after changing its environment; rotating the secret also requires updating Lambda's resource and the app's environment.

The supplied API URL is the default. Optional `KAMPONGLAH_API_BASE_URL` overrides the base URL (without `/kamponglah`), for example an API Gateway stage. HTTPS is required except for localhost fixtures.

## Operations

Collections:

- `kamponglah_complaints`: server-generated ID, author, text, approximate area/place, topic, creation time, normalized search text, and private owner ID.
- `kamponglah_comments`: complaint ID, author, text, creation time, and private owner ID.
- `kamponglah_votes`: one uniquely keyed record per resident/complaint. Like/Dislike sets a choice; clicking the selected choice deletes that vote. Counts aggregate all residents' records.
- `kamponglah_preferences`: a theme per resident.

`actions.ts` contains thin Next.js Server Actions, resolving the resident from the existing Google session or guest cookie. `api.ts` signs a 60-second resident assertion using HMAC-SHA256 over `kamponglah.v1.<base64url JSON>` and calls the external API. This matches `ghg-master-api-v1/docs/kamponglah.md`; it is not a Google token or JWT. The shared key and assertion stay on the server. Actions retain the existing UI result shape.

| Operation | External API |
| --- | --- |
| Feed, search, tabs and location ranking | `GET /kamponglah/feed?query=…&filter=…&area=…` |
| Post complaint | `POST /kamponglah/complaints` |
| Delete own complaint | `DELETE /kamponglah/complaints/{id}` |
| Comment | `POST /kamponglah/complaints/{id}/comments` |
| Delete own comment | `DELETE /kamponglah/comments/{id}` |
| Like, dislike or undo | `PUT /kamponglah/complaints/{id}/vote` |
| Light/dark preference | `PUT /kamponglah/preferences` |

Client-provided authors, owner IDs, timestamps and counts are never forwarded as entry fields. The API generates these values and enforces ownership. Returned snapshots are validated and reduced to public fields, including `canDelete` flags. Entry removal uses a server-side deletion timestamp. Replies/votes on a removed parent disappear from reads; new replies/votes require an active parent. The API's parent check and child write are separate operations; a concurrent deletion can leave a hidden child record.

Signed-in identity is derived from the authenticated Google email, hashed server-side, and follows the account across devices. Public author names are snapshotted from the Google session. “Anonymous” uses only the broad regional label (or Wanderer) publicly; private ownership still allows the resident to manage the entry. Guests receive a random HttpOnly, SameSite=Lax cookie, Secure in production, lasting up to one year. The cookie holds only a guest token; all content and preferences live in MongoDB. Clearing cookies or switching to another browser loses guest ownership. Signing in does not automatically claim earlier guest posts.

The client confirms writes before clearing drafts or changing counts. Failed operations show an error without pretending to save locally. API calls use `no-store`, a 15-second timeout and no automatic retries or redirects; arbitrary upstream error details are kept private. There is no direct MongoDB or browser-storage fallback. A failed/lost response can follow a successful write, so creation requests are not automatically retried. Initial load failure never displays fictional sample posts. The feed loads on entry, when search/filter/location changes, and after confirmed writes. Residents can fetch new community updates with the Refresh button; there is no timed polling or refresh on window focus. The API searches and filters in MongoDB before the 200-result limit; approximate area matches sort first, followed by recency. Client ranking further prioritizes exact address hashtags and related topics. One search field matches main contents and hashtags together, case-insensitively, with or without `#`, including spaced terms matching compact tags. Searches are limited to 200 characters; complaints to 600; comments to 400. There are no automatic expiry or 50-post browser limits.

The current one-list layout, compact thumbs icons, quiet hashtags, Singapore timestamps, Chinese seal, and light/dark palette remain. The kampong chicken background in `public/kamponglah/chicken.png` uses muted earth colours, 128px desktop / 104px mobile, 70% opacity. Its generation brief is in `mascot-chicken-prompt.txt`. Earlier bear assets are retained but unused.

Location is opt-in. Precise coordinates select only an approximate bundled neighbourhood, then are discarded. Area hashtags override location. Hashtag completion uses bundled starter hints, not a full Singapore address directory. Search/location/query/draft state stays in memory. There are **no localStorage reads or writes** in Kamponglah. Old browser-only complaints/comments/votes are not automatically uploaded, and the fictional fixtures are used only in tests.

Validation:

- `npm test -- --runInBand --watchman=false app/kamponglah`
- `npx tsc --noEmit --incremental false`
- Opt-in read-only deployed API check: `KAMPONGLAH_API_TEST=1 npm test -- --runInBand --watchman=false app/kamponglah/api.integration.test.ts`. Requires the matching signing key in the app environment. It reads the feed with a temporary resident identity and never creates or changes real complaints.
