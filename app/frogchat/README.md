# Frogchat

Visit `/frogchat` to automatically join the single shared pond. Each visit gets an
anonymous frog. The page polls `/api/frogchat` every two seconds; sending a croak
updates your frog immediately and other visitors on their next poll. Bubbles last
ten seconds, and every new croak animates the frog for about one second. Sound is
optional and starts off. Enabling sound previews a soft, two-syllable synthesized
croak; each frog has a slightly different voice. Muting fades out active audio.
No audio files or external sound services are needed. No simulated visitors or
automated replies are used.

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

Visitors leave on page exit or expire after 90 seconds without a heartbeat. Chat
history contains the latest 100 messages from the last 30 minutes. Session tokens
are private to each page visit, are hashed in storage, and are never exposed in
other visitors’ snapshots. Message requests are length-limited, rate-limited per
frog, and deduplicated on retry. All messages are rendered as plain text.

## Development

Run `npm run dev` and visit `/frogchat`. Open a second tab to check that both frogs
appear in the pond and that croaks travel between them. Frogchat is also listed
on the workspace homepage and in the command palette.

This copy uses relative imports and supports this app’s MongoDB 5.4 driver,
including its `findOneAndUpdate` result wrapper. The original implementation’s
backend Jest tests remain in `glossaries/.nextjs`. Component and audio tests are
copied alongside `components/frogchat`, but this app has no Jest test runner or
installed Jest/Testing Library dependencies. Test tooling was not added as part
of this promotion. Run `npm run build` for the production build check.
