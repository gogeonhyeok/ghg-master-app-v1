import { timingSafeEqual } from "node:crypto";
import Stripe from "stripe";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
type Context = { params: Promise<{ action: string }> };

class PaymentRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new PaymentRequestError("A JSON request body is required.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) { await reader.cancel(); throw new PaymentRequestError("Payment request is too large.", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body: unknown;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new PaymentRequestError("Send a valid JSON payment request.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new PaymentRequestError("Send a valid JSON payment request.", 400);
  return body as Record<string, unknown>;
}

function configuration() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!secretKey?.startsWith("sk_test_") || !publishableKey?.startsWith("pk_test_")) {
    throw new PaymentRequestError("Stripe sandbox is not configured. Set Stripe test keys on the Next.js server.", 503);
  }
  const configuredAmount = process.env.STRIPE_DEMO_AMOUNT ?? "1000";
  const amount = Number(configuredAmount);
  if (!/^\d+$/.test(configuredAmount) || !Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) {
    throw new PaymentRequestError("The sandbox payment price is not configured correctly.", 503);
  }
  return { secretKey, publishableKey, amount };
}

async function handlePayment(request: Request, context: Context) {
  try {
    const { action } = await context.params;
    if (!["config", "intents", "status"].includes(action)) return Response.json({ error: "Payment endpoint not found." }, { status: 404, headers });
    const method = action === "config" ? "GET" : "POST";
    if (request.method !== method) return Response.json({ error: "Method not allowed." }, { status: 405, headers: { ...headers, Allow: method } });
    let body: Record<string, unknown> | undefined;
    if (method === "POST") {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host") || new URL(request.url).host;
      if (origin) {
        let source: URL;
        try { source = new URL(origin); }
        catch { throw new PaymentRequestError("Start the payment from this website.", 403); }
        if (!["http:", "https:"].includes(source.protocol) || source.host !== host) throw new PaymentRequestError("Start the payment from this website.", 403);
      }
      body = await readBody(request);
      if (action === "intents" && Object.keys(body).length !== 0) throw new PaymentRequestError("The payment price is set by the server.", 400);
      if (action === "status" && (Object.keys(body).length !== 1 || typeof body.clientSecret !== "string" || !/^pi_[A-Za-z0-9]+_secret_[A-Za-z0-9]+$/.test(body.clientSecret))) {
        throw new PaymentRequestError("A valid payment client secret is required.", 400);
      }
    }
    const config = configuration();
    if (action === "config") return Response.json({ publishableKey: config.publishableKey }, { headers });

    // Construct at request time so builds and an unconfigured page need no keys.
    const stripe = new Stripe(config.secretKey, { timeout: 12000, maxNetworkRetries: 0 });
    if (action === "intents") {
      const intent = await stripe.paymentIntents.create({
        amount: config.amount,
        currency: "sgd",
        // Apple Pay and Google Pay also use the card payment method type.
        allowed_payment_method_types: ["card"],
        metadata: { checkout: "payment-workspace" },
      });
      if (intent.livemode || !intent.client_secret) throw new Error("Invalid sandbox intent");
      return Response.json({ id: intent.id, clientSecret: intent.client_secret, amount: intent.amount, currency: intent.currency }, { headers });
    }

    const clientSecret = body!.clientSecret as string;
    const id = clientSecret.split("_secret_")[0];
    const intent = await stripe.paymentIntents.retrieve(id);
    const expected = Buffer.from(intent.client_secret ?? "");
    const supplied = Buffer.from(clientSecret);
    if (intent.livemode || intent.id !== id || intent.metadata.checkout !== "payment-workspace" ||
        expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
      throw new PaymentRequestError("The payment could not be found.", 404);
    }
    return Response.json({
      id: intent.id, status: intent.status, amount: intent.amount, currency: intent.currency,
    }, {
      headers,
    });
  } catch (error) {
    if (error instanceof PaymentRequestError) return Response.json({ error: error.message }, { status: error.status, headers });
    return Response.json({ error: "The payment service is unavailable. Please try again shortly." }, { status: 503, headers });
  }
}

export const GET = handlePayment;
export const POST = handlePayment;
