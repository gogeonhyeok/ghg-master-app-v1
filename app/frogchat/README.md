# Frogchat

Visit `/frogchat` to automatically join the single shared pond. Each visit gets an
anonymous frog. The page subscribes to `/api/frogchat/ws` for live updates. HTTP
POST requests join the pond and save croaks; Redis notifications tell connected
WebSocket instances to send fresh snapshots. There is no recurring HTTP polling. Bubbles last
ten seconds, and every new croak animates the frog for about one second. Sound is
optional and starts off. Enabling sound previews a soft, two-syllable synthesized
croak; each frog has a slightly different voice. Muting fades out active audio.
No audio files or external sound services are needed. No simulated visitors or
automated replies are used.

The route’s components, styles, sound synthesis, and UI tests live together in
`app/frogchat`. The HTTP and WebSocket handlers live in `app/api/frogchat`; shared message types,
browser connection management, server-side socket handling, Redis broadcasts, and
storage code live in `lib/frogchat`.

## Shared storage

The existing `MONGODB_URI` (or `MONGODB_URL`) enables shared storage across Next.js
instances. `MONGODB_DB` selects the database, defaulting to `ghg-master-api-v1`.
The application creates `frogchat_residents` and `frogchat_messages`, with TTL
indexes. The database account needs permission to create these indexes and to
read/write the two collections. A configured database outage returns a retryable
error; it does not silently split visitors into separate ponds.

With neither MongoDB variable configured, an in-memory pond works for development
or a single long-running Node.js server. It resets on restart and is not suitable
for multiple instances or serverless deployment. Use MongoDB in those environments.

The browser sends a heartbeat over its socket every 25 seconds. Heartbeats renew
presence and reconcile snapshots, including missed broadcasts and expired
residents/messages. Visitors leave on page exit or expire after 90 seconds without
a presence renewal. Other visitors see expired residents removed on their next
snapshot (normally within one heartbeat). Socket disconnection alone does not
delete a session, so reconnects preserve the same frog. Chat
history contains the latest 100 messages from the last 30 minutes. Session tokens
are private to each page visit, are hashed in storage, and are never exposed in
other visitors’ snapshots. Message requests are length-limited, rate-limited per
frog, and deduplicated on retry. All messages are rendered as plain text.

## Vercel WebSockets

Enable **Fluid compute** in the Vercel project. Configure these server-only
variables in the deployment environment (and locally when using Vercel dev):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` or `MONGODB_URL` | Existing shared MongoDB storage. |
| `MONGODB_DB` | Optional database name; default `ghg-master-api-v1`. |
| `FROGCHAT_REDIS_URL` or `REDIS_URL` | Redis TCP connection URL, e.g. `rediss://default:PASSWORD@HOST:PORT`. The service must support Redis Pub/Sub; an HTTP REST endpoint/token is insufficient. |
| `FROGCHAT_REDIS_CHANNEL` | Optional broadcast channel. Defaults to `frogchat:${VERCEL_ENV}` on Vercel, or `frogchat:development` elsewhere. Use the same value for instances sharing one pond. |

Use a separate database/channel for independent preview ponds. Production instances
must share both storage and the channel. Vercel deployments fail requests when
MongoDB or Redis is missing instead of silently creating isolated in-memory ponds.
A Redis subscriber is shared by sockets in each instance; subscription failure
closes those sockets so they reconnect and resynchronize.

The server accepts a private session token in the first socket frame, never in a
URL. It checks the browser's Origin before upgrading, limits frames to 4 KiB, and
closes connections that do not authenticate within 10 seconds. Only authenticated
clients receive snapshots. Redis carries invalidation events, not private tokens.
Existing HTTP message length limits, rate limits, and retry deduplication remain.

Connections reconnect with backoff after network failures or Vercel's function
time limit. The socket route sets `maxDuration = 60` to support Hobby deployments
with a 60-second function limit. The browser reconnects automatically when that
limit closes a socket. Each reconnect authenticates
the existing session, subscribes before reading its initial snapshot, and restores
recent history. Expired sessions automatically join again. HTTP GET remains
available for one-off diagnostics but the browser does not poll it.

### Local development

The `upgradeWebSocket()` API requires the Vercel runtime. Plain `next dev` and
`next start` do not provide that runtime. The repo includes a compatible Vercel CLI:

```sh
npm install
npx vercel login          # if this machine is not authenticated
npx vercel link           # select the intended existing Vercel project
npm run dev:vercel
```

Configure the shared-service variables locally before starting. `dev:vercel` runs
`vercel dev`, which runs Next.js through the configured `next dev` command. Keep
`dev` as `next dev` to avoid recursive CLI invocation. No deployment is performed by these
commands.

The repository's `vercel.json` explicitly selects Next.js and `next dev`, so the
CLI loads its WebSocket runtime even when the linked project's framework preset
is unset. Restart `npm run dev:vercel` after changing this configuration.
The origin check uses the CLI's public loopback `VERCEL_URL` (or forwarded
loopback host) during development; production requests still require the
browser's origin host to match Host.

Match the Redis URL scheme to the endpoint: `rediss://` requires TLS, whereas
`redis://` is unencrypted. Redis Cloud Free Essentials endpoints do not support
TLS; using `redis://` sends credentials over an unencrypted connection. For an
encrypted connection, use a TLS-enabled service or plan.

Open `/frogchat` in two tabs and send a croak. In browser DevTools → Network,
`/api/frogchat/ws` should show a WebSocket upgrade and incoming snapshot frames.
The recurring GET requests should be absent; POST join/message and DELETE leave
requests remain. Briefly disconnect/reconnect a tab and confirm its history and
frog recover. For deployments, repeat with browsers connected to different
instances to verify the Redis configuration.

Official references: [Vercel WebSockets](https://vercel.com/docs/functions/websockets)
and [upgradeWebSocket API / local development](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#upgradewebsocket).

## Checks

```sh
npx eslint app/frogchat app/api/frogchat lib/frogchat
npm test -- --runInBand --watchman=false lib/frogchat app/api/frogchat app/frogchat
```

The tests cover authenticated broadcasts, heartbeat expiry, reconnect recovery,
no HTTP polling, and Redis coordination between isolated instance hubs. The wire
integration test opens real WebSocket connections on a temporary loopback port;
it requires permission to listen locally. Redis coordination uses a test double;
verify the configured Redis service in a Vercel preview before production use.
