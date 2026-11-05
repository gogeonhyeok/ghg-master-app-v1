# ghg-master-app-v1

The `/payment` page includes a Stripe sandbox checkout with card entry, Apple
Pay, and Google Pay, using Next.js API routes. See [payment setup and testing](app/payment/README.md).

Run the payment checks with `npm run test:payment`. For optional local HTTPS,
use `npm run dev:https`.

The `/properties` page displays property transactions from the deployed Lambda
with month/location filters, source coverage, USD estimates, sorting and pagination. Start with
`/properties?month=2026-10`. See the [property page guide](app/properties/README.md).

## Google sign-in and shared app bar

The root layout displays the app bar on every page, with Google sign-in,
the signed-in account, sign-out, and a sun/moon theme toggle. The shared theme
provider keeps existing page theme controls connected. A `home-theme` cookie
restores the selection on the next request; existing `theme` local storage
preferences are used when no cookie exists. The initial default is dark.

Set these server-only values in `.env.local` for development and in your hosting
environment for deployment:

```dotenv
AUTH_SECRET=replace-with-a-random-secret
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
AUTH_URL=http://localhost:3000
```

Generate a secret with `openssl rand -base64 32`. In
[Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients),
create or open the **Web application** client matching `AUTH_GOOGLE_ID` and add
`http://localhost:3000/api/auth/callback/google` under **Authorized redirect URIs**.
If the consent screen is in testing mode, add the accounts that will sign in as
test users. Restart the dev server after changing environment variables.

For production, set `AUTH_URL` to your site's HTTPS origin and register
`https://your-domain/api/auth/callback/google` on the same Google client.
For local HTTPS, both settings must use `https://localhost:3000` instead.
The Google button stays disabled until all three credentials are configured.
Auth.js uses encrypted cookie sessions without requiring a user database.

For `Error 400: redirect_uri_mismatch`, make sure `AUTH_URL` contains your app's
origin, rather than Google's authorization endpoint. The callback's scheme,
host, port, path, and trailing slash must exactly match an authorized redirect
URI. **Authorized JavaScript origins** is a separate field.

Run the auth and shared UI checks with `npm run test:auth`.
See the [Auth.js Google provider](https://authjs.dev/getting-started/providers/google)
for provider configuration.

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/nextjs-azh7hd)
