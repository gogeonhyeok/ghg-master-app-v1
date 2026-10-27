# Frogchat — the white room

`/frogchat` opens one shared white room. The supplied pixel frog is the only
character asset (`public/frogchat/frog.svg`); there are no background images,
scene switching, sounds, themes, or idle animations.

- Frogs stand on one horizontal baseline slightly below the middle of the room.
- Use **← / →** (or A / D) to move, and **Space** (or ↑ / W) to jump.
- The on-screen arrow buttons support press-and-hold, and Jump works on touch.
- Jumps include a small takeoff squash, a stretch into the air, and a landing
  squash/rebound before returning to normal within the same 650 ms jump. Only
  the frog artwork scales; the name tag and bubble stay readable and follow the
  jump, while its shadow stays on the ground.
- The line and all frogs share one explicit baseline inside the scene. The room
  uses grid sizing, explicit field edges, and a `100vh` fallback for browsers
  that do not support dynamic viewport units.
- Keyboard controls leave text inputs and other interactive elements alone.
- Each new message gives its frog a small squash-and-bounce. Your own frog
  reacts immediately on send; saving the same message does not replay the
  animation. Other frogs react when their message arrives. This reaction does
  not interrupt jumps or remount the artwork, and reduced-motion mode disables it.
- Sent messages appear above their frog for **five seconds**, then disappear
  from the scene while remaining in the message history on the right.
- The composer stays at the bottom. On small screens, **Chat** opens the right
  sidebar so the room and composer remain usable.
- Reduced-motion mode replaces the full jump with a small hop and disables
  sliding and squash animations. There are no ambient animations or idle clock timers.

Movement and jumps use authenticated WebSocket frames. Your browser predicts the
action immediately. Each input has a sequence number; the server returns an
acknowledgement with the confirmed frog state, and the browser reapplies inputs
that have not been acknowledged yet. Rejected inputs are corrected. A stable jump
ID owns a single browser animation timeline. The artwork stays mounted between
jumps; takeoff/landing animations run through the Web Animations API, without
recreating the SVG image or toggling CSS animations. Corrected acknowledgement
timestamps cannot restart or truncate an already playing jump. Newly observed
remote jumps seek to their current phase once, and completed jumps do not replay.
Reduced-motion preference changes preserve the current jump phase.
See the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
for the browser animation mechanism. Local movement starts
on the next display frame and travels toward the predicted position over the
150 ms input interval. A rejected input corrects from the current visible
position rather than restarting from an old target.

Remote movement keeps up to 12 timestamped positions per frog in a browser-only
cache. It renders 180 ms behind the estimated server timeline and interpolates
between confirmed positions, absorbing ordinary packet jitter. This deliberately
adds a small visual delay for other frogs; your own frog has no interpolation
buffer. Missing updates hold the last confirmed position, without extrapolation
or overshooting. Large recovery corrections snap to the recovered position.

Horizontal motion uses composited `translate3d` transforms and one shared
`requestAnimationFrame` callback for moving frogs. Frames update DOM transforms
directly, without rerendering the React tree or message history. The loop stops
when movement settles, cancels on unmount, and discards old interpolation on tab
resume. Reduced-motion mode displays updated positions directly. Names, bubbles,
and grounded shadows remain attached to their moving frog.

Unchanged snapshots retain their original motion timestamps. Latest messages are
indexed once per history update, and unchanged frogs are memoized, so a moving
neighbor does not repeatedly scan or rerender everyone else's chat bubbles.
This cache affects browser presentation only; Redis still validates movement.
See the [browser frame API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
for the refresh-driven animation mechanism.

The server owns bounds, speed limits, facing, and jump cooldowns. A bounded queue
processes inputs in order instead of dropping them while a database call is busy.
Cooldowns use server receipt times, so delayed processing does not turn normally
spaced inputs into a burst. Monotonic movement versions prevent late snapshots or
Redis events from moving frogs back to old positions.

Redis holds live sessions, positions, facing, jump IDs/timestamps, movement
versions, and presence. Each movement frame authenticates the session, checks
bounds/cooldowns, updates state, and renews presence in one atomic Lua operation.
The movement path does not connect to MongoDB or read message history. Redis
broadcasts small public frog updates across instances; movement does not reload
the room for each viewer. Commands and publishing share a connection, alongside
one separate subscriber connection per instance.

MongoDB stores message history only. Full snapshots combine current Redis frogs
with MongoDB messages for join, chat/history changes, departures, heartbeat
recovery, and reconnects. The browser still predicts its own movement immediately;
remote frogs use the bounded interpolation cache above. High network latency or
jitter beyond the buffer can still affect perceived smoothness.

No new services or environment variables are required. The existing Redis URL
now needs permission for Lua scripts, hashes, sorted sets, expiry, and Pub/Sub
(the standard Redis user supports these). Storage keys are isolated by the same
channel namespace used for broadcasts. Sessions expire after 90 seconds without
activity; snapshots prune expired residents, and the live keys expire when the
whole namespace is inactive. Redis connection errors fail the request rather
than switching active sessions to isolated memory.

After this update, existing MongoDB-backed sessions will rejoin once. Saved
message history is retained; the old `frogchat_residents` collection is no longer
read or written. Losing or clearing Redis live state also requires rejoining;
positions are intentionally temporary. Without a Redis URL, local development
keeps live sessions in process memory, which is suitable for a single instance.
Vercel continues to require shared Redis and MongoDB.

Sent messages appear immediately with a **Sending…** label while the existing
HTTP save runs. A failed save removes the pending entry and retains the draft for
retry with the same request ID. A slow successful save does not restart the local
five-second bubble. History rendering is memoized during movement, and typing
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
| `MONGODB_URI` or `MONGODB_URL` | Shared MongoDB message history. |
| `MONGODB_DB` | Optional database name; default `ghg-master-api-v1`. |
| `FROGCHAT_REDIS_URL` or `REDIS_URL` | Redis TCP connection URL, e.g. `rediss://default:PASSWORD@HOST:PORT`. The service must support Lua scripts and Redis Pub/Sub; an HTTP REST endpoint/token is insufficient. |
| `FROGCHAT_REDIS_CHANNEL` | Optional broadcast channel and live-state namespace. Defaults to `frogchat:${VERCEL_ENV}` on Vercel, or `frogchat:development` elsewhere. Use the same value for instances sharing one pond. |

Use a separate database/channel to isolate preview deployments from production. Production instances
must share both storage and the channel. Vercel deployments fail requests when
MongoDB or Redis is missing instead of silently creating isolated in-memory ponds.
A Redis subscriber is shared by sockets in each instance; subscription failure
closes those sockets so they reconnect and resynchronize.

The server accepts a private session token in the first socket frame, never in a
URL. It checks the browser's Origin before upgrading, limits frames to 4 KiB, and
closes connections that do not authenticate within 10 seconds. Only authenticated
clients receive snapshots. Redis Pub/Sub carries public frog updates and invalidation
events. Private live-state records use hashed session tokens; raw tokens are
never stored or broadcast.
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

The tests cover five-second bubbles, delayed-save feedback, immediate prediction,
acknowledgement/replay and rejection, stale versions, timestamped interpolation,
packet jitter, bounded caches, idle-frame cleanup, reduced motion, tab resume,
input-safe keyboard controls,
held movement, remote jumps, bounds and cooldowns, queued slow writes, authenticated
delta broadcasts without room reads, reconnect recovery, and Redis coordination.
The wire integration test opens real WebSocket connections
on a temporary loopback port and verifies messages, motion, jumps, and recovery;
it requires permission to listen locally. Redis notification unit tests use a test double. A separate opt-in suite runs
against real Redis to verify concurrent updates across connections, cooldowns,
bounds, expiry, namespace isolation, reconnect snapshots, and the absence of
MongoDB calls during movement:

```sh
# Use a disposable local Redis instance; each test uses and removes unique keys.
FROGCHAT_TEST_REDIS_URL=redis://127.0.0.1:6379 npm test -- --runInBand --watchman=false lib/frogchat/live-state.integration.test.ts
```

The integration suite never uses the app's Redis URL or real MongoDB service;
message storage is stubbed so only the Redis state and Pub/Sub path are external.

This app retains MongoDB driver 5. `store.mongo.test.ts` checks message storage,
retry deduplication, expiry queries, and legacy room history with its document
and cursor API. Live residents no longer use MongoDB's modify-result wrappers.
