"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Appearance, Stripe, StripeElementsOptions, StripeExpressCheckoutElementClickEvent, StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import styles from "./page.module.css";

type Intent = { id: string; clientSecret: string; amount: number; currency: string };
type Session = { stripe: Stripe; intent: Intent };

async function paymentRequest(action: string, body?: object) {
  const response = await fetch(`/api/payments/stripe/${action}`, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("The payment service returned an invalid response.");
  const value = data as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof value.error === "string" ? value.error : "The payment service is unavailable.");
  return value;
}

function appearance(dark: boolean): Appearance {
  return {
    theme: dark ? "night" : "stripe",
    variables: {
      colorPrimary: "#635bdb",
      colorBackground: dark ? "#191f30" : "#ffffff",
      colorText: dark ? "#eff0fa" : "#172034",
      colorTextSecondary: dark ? "#a5b0c5" : "#58657b",
      colorDanger: dark ? "#ffb4b4" : "#b42318",
      fontFamily: "Arial, sans-serif",
      borderRadius: "8px",
      spacingUnit: "4px",
    },
  };
}

export default function StripeCheckout({ dark }: { dark: boolean }) {
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const startingRef = useRef(false);
  const options = useMemo<StripeElementsOptions>(() => ({
    clientSecret: session?.intent.clientSecret,
    appearance: appearance(dark),
    loader: "auto",
  }), [session, dark]);

  async function startPayment() {
    if (startingRef.current || session) return;
    startingRef.current = true;
    setStarting(true);
    setError("");
    try {
      const config = await paymentRequest("config");
      if (typeof config.publishableKey !== "string" || !config.publishableKey.startsWith("pk_test_")) {
        throw new Error("Stripe sandbox is not configured. Please connect test keys on the payment server.");
      }
      // Load Stripe only when requested, before creating a server-priced intent.
      const stripe = await loadStripe(config.publishableKey);
      if (!stripe) throw new Error("Stripe could not load. Check your connection and try again.");
      const intent = await paymentRequest("intents", {});
      if (typeof intent.id !== "string" || !/^pi_[A-Za-z0-9]+$/.test(intent.id) ||
          typeof intent.clientSecret !== "string" || !intent.clientSecret.startsWith(`${intent.id}_secret_`) ||
          typeof intent.amount !== "number" || !Number.isSafeInteger(intent.amount) || intent.amount < 50 ||
          intent.currency !== "sgd") {
        throw new Error("The payment server returned an invalid checkout. Please try again later.");
      }
      setSession({ stripe, intent: intent as Intent });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start the test payment.");
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }

  return (
    <section id="stripe-checkout" className={styles.stripeSection} aria-labelledby="stripe-checkout-title">
      <div className={styles.stripeIntro}>
        <div className={styles.stripeIdentity}><span className={styles.stripeWordmark}>stripe</span><span className={styles.sandboxBadge}>Sandbox</span></div>
        <h1 id="stripe-checkout-title">A real checkout.<br /><em>A test payment.</em></h1>
        <p>Pay with Apple Pay, Google Pay, or a card. Stripe handles your payment details securely.</p>
        <div className={styles.testCard}>
          <span>Try this test card</span>
          <code>4242 4242 4242 4242</code>
          <p>Use any future expiry date and any three-digit CVC. No real money is charged.</p>
        </div>
        <a href="https://docs.stripe.com/testing#cards" target="_blank" rel="noreferrer">More test cards ↗</a>
      </div>
      <div className={styles.stripePanel}>
        {session ? (
          <Elements stripe={session.stripe} options={options}>
            <CheckoutForm intent={session.intent} onReset={() => setSession(null)} />
          </Elements>
        ) : (
          <div className={styles.stripeWelcome} aria-busy={starting}>
            <span className={styles.checkoutIcon} aria-hidden="true">↗</span>
            <h2>Ready when you are.</h2>
            <p>Start a sandbox checkout to see the price and choose a wallet or test card.</p>
            <button className={styles.stripePrimary} type="button" disabled={starting} onClick={startPayment}>
              {starting ? "Preparing checkout…" : "Start test payment"}
            </button>
            {error && <p className={styles.stripeError} role="alert">{error}</p>}
            <p className={styles.stripeFinePrint}>Test mode · Powered by Stripe</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CheckoutForm({ intent, onReset }: { intent: Intent; onReset: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  // This form mounts only after the browser starts a session. Leave the
  // unsupported wallet iframe unmounted on HTTP so card testing stays usable.
  const [walletsUseHttps] = useState(() => typeof window !== "undefined" && window.location.protocol === "https:");
  const [walletsAvailable, setWalletsAvailable] = useState<boolean | null>(walletsUseHttps ? null : false);
  const [walletOpen, setWalletOpen] = useState(false);
  const busyRef = useRef(false);
  const confirmationSentRef = useRef(false);
  const walletOpenRef = useRef(false);
  const amount = new Intl.NumberFormat("en-SG", { style: "currency", currency: intent.currency, currencyDisplay: "code" }).format(intent.amount / 100);
  const settled = status === "succeeded" || status === "canceled";

  function markConfirmationSent(value: boolean) {
    confirmationSentRef.current = value;
    setConfirmationSent(value);
  }

  function markWalletOpen(value: boolean) {
    walletOpenRef.current = value;
    setWalletOpen(value);
  }

  function openWallet(event: StripeExpressCheckoutElementClickEvent) {
    if (!stripe || !elements || busyRef.current || confirmationSentRef.current || walletOpenRef.current || settled) {
      event.reject();
      return;
    }
    markWalletOpen(true);
    setError("");
    event.resolve();
  }

  async function readStatus() {
    const result = await paymentRequest("status", { clientSecret: intent.clientSecret });
    const knownStatuses = ["succeeded", "processing", "requires_payment_method", "requires_confirmation", "requires_action", "requires_capture", "canceled"];
    if (result.id !== intent.id || result.amount !== intent.amount || result.currency !== intent.currency ||
        typeof result.status !== "string" || !knownStatuses.includes(result.status)) {
      throw new Error("The payment result could not be verified. Check its status before paying again.");
    }
    setStatus(result.status);
    markConfirmationSent(!["requires_payment_method", "requires_confirmation", "requires_action"].includes(result.status));
    if (result.status === "requires_payment_method") setError("The payment was not completed. Choose a wallet or check your test card and try again.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !complete || walletOpenRef.current) return;
    await confirmPayment();
  }

  async function confirmPayment(walletEvent?: StripeExpressCheckoutElementConfirmEvent) {
    // Ignore a duplicate authorization while the original wallet sheet is
    // confirming; reporting it as failed could dismiss that active payment.
    if (busyRef.current) return;
    if (!stripe || !elements || confirmationSentRef.current || settled) {
      walletEvent?.paymentFailed({ reason: "fail", message: "Check the current payment status before trying again." });
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    // If the connection fails after confirmation, verify this intent rather than
    // creating another payment or blindly confirming it again.
    let stripeConfirmed = false;
    try {
      if (walletEvent) {
        // Wallet authorization is independent of the card form's completeness.
        const { error: submitError } = await elements.submit();
        if (submitError) {
          const message = submitError.message || "Your wallet payment details could not be validated.";
          setError(message);
          walletEvent.paymentFailed({ reason: "fail", message });
          return;
        }
      }
      markConfirmationSent(true);
      const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
      if (result.error) {
        setError(result.error.message || "The payment could not be confirmed.");
        markConfirmationSent(!["card_error", "validation_error"].includes(result.error.type));
        walletEvent?.paymentFailed({ reason: "fail", message: result.error.message });
        return;
      }
      stripeConfirmed = true;
      await readStatus();
    } catch {
      const message = confirmationSentRef.current
        ? "We couldn’t verify the payment result. Check its status before paying again."
        : "Your wallet could not be prepared. Please try again or use a test card.";
      setError(message);
      // A failed status request must not turn a confirmed wallet payment into
      // an apparent decline in the wallet sheet.
      if (!stripeConfirmed) walletEvent?.paymentFailed({ reason: "fail", message });
    } finally {
      busyRef.current = false;
      setBusy(false);
      markWalletOpen(false);
    }
  }

  async function checkStatus() {
    if (busyRef.current || walletOpenRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try { await readStatus(); }
    catch { setError("Payment status is temporarily unavailable. Please check again shortly."); }
    finally { busyRef.current = false; setBusy(false); }
  }

  return (
    <form onSubmit={submit} className={styles.stripeForm} aria-busy={busy}>
      <div className={styles.stripeSummary}><div><p className={styles.eyebrow}>Sandbox payment</p><h2>Demo purchase</h2></div><strong>{amount}</strong></div>
      {!settled && <>
        <div className={styles.stripeWallets} aria-label="Express wallet checkout" aria-disabled={busy || confirmationSent}>
          {walletsAvailable && <p className={styles.stripeWalletLabel}>Pay with your wallet</p>}
          {walletsUseHttps && <ExpressCheckoutElement
            options={{
              buttonHeight: 48,
              paymentMethods: { applePay: "always", googlePay: "always", link: "never", paypal: "never", amazonPay: "never", klarna: "never" },
            }}
            onReady={({ availablePaymentMethods }) => setWalletsAvailable(Boolean(availablePaymentMethods?.applePay || availablePaymentMethods?.googlePay))}
            onAvailablePaymentMethodsChange={({ paymentMethods }) => setWalletsAvailable(Boolean(paymentMethods?.applePay?.available || paymentMethods?.googlePay?.available))}
            onClick={openWallet}
            onConfirm={confirmPayment}
            onCancel={() => { if (!busyRef.current) markWalletOpen(false); }}
            onLoadError={() => setWalletsAvailable(false)}
          />}
        </div>
        {walletsAvailable === false && <p className={styles.stripeWalletHint}>Wallets are unavailable here. Apple Pay and Google Pay need HTTPS and a supported browser or device. You can still use a test card below.</p>}
        <div className={styles.stripeDivider}>{walletsAvailable ? "Or pay by card" : "Pay by card"}</div>
      </>}
      {!settled && <PaymentElement
        options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never", link: "never" } }}
        onReady={() => setReady(true)}
        onChange={(event) => setComplete(event.complete)}
        onLoadError={() => { setReady(false); setError("Stripe’s payment form could not load. Check your connection and reload the page."); }}
      />}
      <div className={styles.stripeMessages} aria-live="polite">
        {error && <p className={styles.stripeError} role="alert">{error}</p>}
        {status === "succeeded" && <div className={styles.stripeSuccess} role="status"><strong>Test payment successful.</strong><p>{amount} was paid in Stripe sandbox.</p><small>Payment reference: {intent.id}</small></div>}
        {status === "processing" && <p role="status">Your payment is processing. Check its status again shortly.</p>}
        {status === "requires_capture" && <p role="status">Your test payment is authorized and awaiting capture.</p>}
        {status === "requires_action" && <p role="status">Additional authentication is needed. Continue the payment to finish.</p>}
        {status === "requires_confirmation" && <p role="status">Your payment is ready to confirm. Continue below.</p>}
        {status === "canceled" && <p role="status">This test payment was canceled. You can start a new checkout.</p>}
      </div>
      {settled ? <button type="button" className={styles.stripePrimary} onClick={onReset}>Start another test payment</button> : (
        <>
          <button className={styles.stripePrimary} type="submit" disabled={!stripe || !elements || !ready || !complete || busy || confirmationSent || walletOpen}>
            {busy ? "Checking payment…" : `Pay ${amount} in test mode`}
          </button>
          {confirmationSent && <button className={styles.stripeSecondary} type="button" disabled={busy || walletOpen} onClick={checkStatus}>Check payment status</button>}
        </>
      )}
      <p className={styles.stripeFinePrint}>Wallets and secure card entry by Stripe · Test payments only</p>
    </form>
  );
}
