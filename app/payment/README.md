# Stripe sandbox checkout

Open `/payment` and choose **Start test payment** in the Stripe section. The
existing method catalog and mock checkout remain separate planning tools.

The checkout uses Stripe's Express Checkout Element for Apple Pay and Google
Pay, plus the Payment Element for card entry. Payment details go directly to
Stripe. The Next.js server uses the official `stripe`
Node.js SDK for intent creation and status verification. Quarkus is not required.

```text
Browser → /api/payments/stripe/* (Next.js) → Stripe API
Browser → Stripe Elements → Stripe (wallets, card details, and confirmation)
```

## Run locally

Create `.env.local` using keys from the same Stripe sandbox:

```dotenv
STRIPE_SECRET_KEY=sk_test_REPLACE_ME
STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_ME
STRIPE_DEMO_AMOUNT=1000
```

Use your own sandbox keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
`STRIPE_DEMO_AMOUNT` is optional and defaults to `1000` (SGD 10.00). The server
fixes the currency to SGD and rejects prices sent by the browser. Both keys
must be test keys. Start Next.js from this app directory:

```sh
npm install
npm run dev
```

Restart Next.js after changing keys. Keep `STRIPE_SECRET_KEY` server-only;
do not prefix it with `NEXT_PUBLIC_`. `/api/payments/stripe/config` returns only
the publishable key. The `/intents` and `/status` actions talk directly to
Stripe; `STRIPE_BACKEND_URL` and `STRIPE_ENABLED` are no longer used by this app.

## Test a payment

1. Visit `/payment` and choose **Start test payment**.
2. Check the amount returned by the server (SGD 10.00 by default).
3. Enter `4242 4242 4242 4242`, a future expiry, and any three-digit CVC.
4. Submit the payment. Success appears after the Next.js server verifies its status with Stripe.

For a decline, use `4000 0000 0000 0002`. For authentication, use
`4000 0025 0000 3155`. See [Stripe's test cards](https://docs.stripe.com/testing#cards).
Retries reuse the same intent. If confirmation or status verification is
interrupted, **Check payment status** verifies that intent before another
confirmation is allowed. The checkout never automatically creates a replacement
payment. Intent credentials stay in component memory and POST bodies.

Only sandbox keys and SGD card intents are supported by this checkout.
Apple Pay and Google Pay use the same `card` payment method type; no additional
API keys or intent types are needed. Wallet buttons appear above the card form
when Stripe reports them as available. Wallet cancellation, validation errors,
or declines leave the card option available on the same intent. During wallet authorization,
card submission is blocked to prevent concurrent confirmations.

Confirmations use `redirect: "if_required"`, allowing authentication in
Stripe's UI without a successful-card redirect. Supporting redirect-based
payment methods would also require a return-page flow.

## Apple Pay and Google Pay testing

Enabling wallets in the Dashboard is only part of setup. Stripe requires
HTTPS for Express Checkout wallets in development and production. Ordinary
`http://localhost:3000/payment` still supports sandbox card entry, but should
not be used to verify wallet availability. If Stripe cannot display wallets,
the checkout explains the requirements and keeps the card form available.

For a reliable test of a local app:

1. Run `npm run dev` and expose it through an HTTPS development tunnel, or
   deploy the app to an HTTPS preview URL. Stripe's guide gives ngrok as an
   example. This exposes the app at the tunnel URL; no tunnel is started by
   this project.
2. In the same Stripe sandbox as your test keys, open
   [Payment method domains](https://dashboard.stripe.com/settings/payment_method_domains)
   and register the exact HTTPS hostname. Register each subdomain separately;
   update this entry if your tunnel hostname changes.
3. Open that HTTPS URL on a supported browser/device with Apple Wallet or
   Google Pay configured. Avoid private/incognito browsing. For example,
   test Apple Pay in Safari on a compatible Apple device, and Google Pay in
   Chrome with Google Pay configured.
4. Choose **Start test payment**, then a wallet button. Its authorization
   confirms the existing sandbox intent and the server verifies the status.

The wallet configuration uses `always` to allow Stripe to offer wallet setup
on supported platforms. It does not bypass HTTPS, domain registration,
browser, or region requirements, and does not simulate a wallet.

For local HTTPS development, an optional command is also available:

```sh
npm run dev:https
```

This uses Next.js's development certificate support at
`https://localhost:3000`. It does not register a Stripe payment domain or
guarantee wallet availability. Use a valid certificate accepted by the browser;
for wallet acceptance testing, prefer the registered HTTPS hostname above.
The default `npm run dev` continues to use HTTP.

References: [Express Checkout requirements](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment?payment-ui=elements),
[domain registration for local testing](https://docs.stripe.com/payments/payment-methods/pmd-registration?dashboard-or-api=dashboard),
and [wallet troubleshooting](https://docs.stripe.com/testing/wallets?ui=express-checkout-element).

This sandbox demo displays payment status and does not fulfill orders. It has
no webhook endpoint or durable order storage. Production order fulfillment
would need a verified webhook handler and durable order records in Next.js.

Implementation references: [create a PaymentIntent](https://docs.stripe.com/api/payment_intents/create),
[retrieve a PaymentIntent](https://docs.stripe.com/api/payment_intents/retrieve),
and [Stripe's Node.js SDK](https://github.com/stripe/stripe-node).

## Checks

```sh
npm run test:payment
```

The tests mock Stripe.js and the Stripe Node.js SDK to cover intent creation,
duplicate submits, wallet authorization/cancellation/validation, card fallback,
declines, uncertain confirmations, pending payments,
client-secret verification, sandbox configuration, cross-origin writes, and server-owned pricing. Real browser card
and authentication tests require configured Stripe sandbox keys.
