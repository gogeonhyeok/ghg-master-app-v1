# Frogchat — the white room

`/frogchat` opens one shared white room. The supplied pixel frog is the only
character asset (`public/frogchat/frog.svg`); there are no background images,
scene switching, sounds, themes, or idle animations.

- Frogs stand on one horizontal baseline slightly below the middle of the room.
- Use **← / →** (or A / D) to move, and **Space** (or ↑ / W) to jump.
- The on-screen arrow buttons support press-and-hold, and Jump works on touch.
- The name tag and speech bubble travel with a jumping frog; its shadow stays
  on the ground.
- Keyboard controls leave text inputs and other interactive elements alone.
- Sent messages appear above their frog for **three seconds**, then disappear
  from the scene while remaining in the message history on the right.
- The composer stays at the bottom. On small screens, **Chat** opens the right
  sidebar so the room and composer remain usable.
- Reduced-motion mode replaces the full jump with a small hop and disables
  sliding transitions. There are no ambient animations or idle clock timers.

Movement and jumps use authenticated WebSocket frames. Your browser predicts the
action immediately. Each input has a sequence number; the server returns an
acknowledgement with the confirmed frog state, and the browser reapplies inputs
that have not been acknowledged yet. Rejected inputs are corrected. A stable jump
ID prevents acknowledgements from restarting the animation. Other frogs use the
existing short CSS transition to smooth position updates.

The server owns bounds, speed limits, facing, and jump cooldowns. A bounded queue
processes inputs in order instead of dropping them while a database call is busy.
Cooldowns use server receipt times, so delayed processing does not turn normally
spaced inputs into a burst. Monotonic movement versions prevent late snapshots or
Redis events from moving frogs back to old positions.

Redis broadcasts small public frog updates across instances; movement does not
reload the room or message history for each viewer. Full snapshots remain for
join, chat/history changes, departures, heartbeat recovery, and reconnects. Live
positions still persist in MongoDB, so the server path still depends on database
latency. No new services or environment variables are required.

Sent messages appear immediately with a **Sending…** label while the existing
HTTP save runs. A failed save removes the pending entry and retains the draft for
retry with the same request ID. A slow successful save does not restart the local
three-second bubble. History rendering is memoized during movement, and typing
does not rerender the scene.

Reconnects discard unconfirmed predictions and restore the server's current
state. Movement frames do not create extra HTTP POST requests. The camera uses
normalized positions so the same scene fits different screen sizes; frogs may
pass each other.

Joining, saving messages, and leaving retain the existing HTTP endpoints. History
is limited to the latest 100 messages within 30 minutes, and presence expires
without a heartbeat after 90 seconds. No simulated visitors or replies are used.

## Archived illustrated version

The entire previous three-pond implementation, including supplied frog SVGs,
generated day/night backgrounds, backend, tests, and configuration, is preserved
in [`archive/frogchat-illustrated-2026-10-27.tar.gz`](../../archive/frogchat-illustrated-2026-10-27.tar.gz).
All 40 files were verified against the adjacent SHA-256 manifest before changing
the active app. See [the archive guide](../../archive/README.md) for restoration.
The archive is outside `app` and introduces no Next.js routes.

## Vercel WebSockets

The repository's `vercel.json` enables **Fluid compute**, which Vercel requires
for WebSockets. Redeploy after changing this setting; a working local
`vercel dev` socket does not confirm that the deployed runtime supports upgrades.
Configure these server-only
variables in the deployment environment (and locally when using Vercel dev):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` or `MONGODB_URL` | Existing shared MongoDB storage. |
| `MONGODB_DB` | Optional database name; default `ghg-master-api-v1`. |
| `FROGCHAT_REDIS_URL` or `REDIS_URL` | Redis TCP connection URL, e.g. `rediss://default:PASSWORD@HOST:PORT`. The service must support Redis Pub/Sub; an HTTP REST endpoint/token is insufficient. |
| `FROGCHAT_REDIS_CHANNEL` | Optional broadcast channel. Defaults to `frogchat:${VERCEL_ENV}` on Vercel, or `frogchat:development` elsewhere. Use the same value for instances sharing one pond. |

Use a separate database/channel to isolate preview deployments from production. Production instances
must share both storage and the channel. Vercel deployments fail requests when
MongoDB or Redis is missing instead of silently creating isolated in-memory ponds.
A Redis subscriber is shared by sockets in each instance; subscription failure
closes those sockets so they reconnect and resynchronize.

The server accepts a private session token in the first socket frame, never in a
URL. It checks the browser's Origin before upgrading, limits frames to 4 KiB, and
closes connections that do not authenticate within 10 seconds. Only authenticated
clients receive snapshots. Redis carries public frog updates and invalidation
events, never private tokens.
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

Run only one Next.js development server for this workspace at a time. A second
`npm run dev:vercel` can show `FUNCTION_INVOCATION_FAILED` when its Next.js child
exits with **Another next dev server is already running**. Changing the HTTP port
does not isolate the shared `.next/dev` directory. Stop the previous `next dev`
or `vercel dev` in its terminal with Ctrl+C, then restart and use the URL printed
by the new server. If its terminal is gone, the Next.js error identifies the
specific stale PID to stop. Keep `dev` as `next dev`; `dev:vercel` wraps it.

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

### Deployed page stays on “Reconnecting”

The composer becomes available after the authenticated WebSocket sends its first
snapshot. A successful HTTP join alone does not mean the socket connected.
In browser DevTools → Network, inspect `/api/frogchat/ws`:

- `101`: the upgrade succeeded; inspect incoming frames and the close code.
  An error frame or close code `1013` can indicate a Redis subscription or
  database failure. Check the corresponding Vercel function logs and Redis
  connection limits.
- `403`: the Origin check rejected the request; compare the page's host with
  the host received by the function. Keep the same-origin protection enabled.
- `503`: check deployed MongoDB/Redis configuration and runtime support for
  `upgradeWebSocket`. Ensure the deployment uses Fluid compute.
- `502` before any socket frames: check Fluid compute first. An older project
  can still have it disabled even though local WebSockets work. Deploy the
  repository's `"fluid": true` configuration, or enable it in Settings → Functions
  and redeploy.

Environment changes and `vercel.json` changes require a new deployment. Settings
in a local `.env.local` file do not configure the Vercel deployment environment.

## Checks

```sh
npx tsc --noEmit --incremental false
npm test -- --runInBand --watchman=false lib/frogchat app/api/frogchat app/frogchat
```

The tests cover three-second bubbles, delayed-save feedback, immediate prediction,
acknowledgement/replay and rejection, stale versions, input-safe keyboard controls,
held movement, remote jumps, bounds and cooldowns, queued slow writes, authenticated
delta broadcasts without room reads, reconnect recovery, and Redis coordination.
The wire integration test opens real WebSocket connections
on a temporary loopback port and verifies messages, motion, jumps, and recovery;
it requires permission to listen locally. Redis coordination uses a test double.

This app retains MongoDB driver 5. Its `findOneAndUpdate` and `findOneAndDelete`
responses wrap the document in `.value`; `store.mongo.test.ts` checks authentication,
atomic movement/jump claims and acknowledgements, message rate limits, and departures
with that format.
