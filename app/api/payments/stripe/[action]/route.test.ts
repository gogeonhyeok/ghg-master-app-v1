/** @jest-environment node */
import { afterEach, beforeEach, expect, test } from "@jest/globals";
import Stripe from "stripe";
import { GET, POST } from "./route";

declare const jest: typeof import("@jest/globals").jest;
const createIntent = jest.fn<(params: Stripe.PaymentIntentCreateParams) => Promise<Partial<Stripe.PaymentIntent>>>();
const retrieveIntent = jest.fn<(id: string) => Promise<Partial<Stripe.PaymentIntent>>>();
jest.mock("stripe", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ paymentIntents: { create: createIntent, retrieve: retrieveIntent } })),
}));

const environmentKeys = ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_DEMO_AMOUNT"] as const;
const originalEnvironment = environmentKeys.map((key) => process.env[key]);
const context = (action: string) => ({ params: Promise.resolve({ action }) });
const secret = "pi_test123_secret_demo";
const intent = {
  id: "pi_test123", client_secret: secret, amount: 1000, currency: "sgd",
  livemode: false, status: "succeeded", metadata: { checkout: "payment-workspace" },
} satisfies Partial<Stripe.PaymentIntent>;

function post(action: string, body: unknown, origin = "http://localhost:3000") {
  return new Request(`http://localhost:3000/api/payments/stripe/${action}`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body),
  });
}
beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_demo";
  process.env.STRIPE_PUBLISHABLE_KEY = "pk_test_demo";
  delete process.env.STRIPE_DEMO_AMOUNT;
  createIntent.mockReset().mockResolvedValue(intent);
  retrieveIntent.mockReset().mockResolvedValue(intent);
});
afterEach(() => {
  environmentKeys.forEach((key, index) => {
    const value = originalEnvironment[index];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
});

test("returns only the publishable key without calling Stripe or caching it", async () => {
  const result = await GET(new Request("http://localhost:3000/api/payments/stripe/config?amount=1"), context("config"));
  expect(result.status).toBe(200);
  expect(result.headers.get("cache-control")).toBe("no-store");
  expect(await result.json()).toEqual({ publishableKey: "pk_test_demo" });
  expect(Stripe).not.toHaveBeenCalled();
});

test("creates a card intent directly with Stripe using the server-owned price", async () => {
  process.env.STRIPE_DEMO_AMOUNT = "2500";
  createIntent.mockResolvedValueOnce({ ...intent, amount: 2500 });
  const result = await POST(post("intents", {}), context("intents"));
  expect(result.status).toBe(200);
  expect(Stripe).toHaveBeenCalledWith("sk_test_demo", { timeout: 12000, maxNetworkRetries: 0 });
  expect(createIntent).toHaveBeenCalledWith({ amount: 2500, currency: "sgd", allowed_payment_method_types: ["card"], metadata: { checkout: "payment-workspace" } });
  expect(await result.json()).toEqual({ id: intent.id, clientSecret: secret, amount: 2500, currency: "sgd" });
  expect(result.headers.get("cache-control")).toBe("no-store");
});

test("uses the default price and verifies status without exposing Stripe's full object", async () => {
  await POST(post("intents", {}), context("intents"));
  expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 1000 }));
  const result = await POST(post("status", { clientSecret: secret }), context("status"));
  expect(retrieveIntent).toHaveBeenCalledWith(intent.id);
  expect(await result.json()).toEqual({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" });
});

test("requires the matching client secret and an intent created by this sandbox checkout", async () => {
  for (const changed of [
    { client_secret: "pi_test123_secret_other" }, { client_secret: null },
    { metadata: {} }, { livemode: true }, { id: "pi_other" },
  ]) {
    retrieveIntent.mockResolvedValueOnce({ ...intent, ...changed });
    const result = await POST(post("status", { clientSecret: secret }), context("status"));
    expect(result.status).toBe(404);
    expect(await result.json()).toEqual({ error: "The payment could not be found." });
  }
});

test("rejects client-supplied prices, invalid secrets and cross-origin writes before contacting Stripe", async () => {
  expect((await POST(post("intents", { amount: 1 }), context("intents"))).status).toBe(400);
  expect((await POST(post("status", { clientSecret: "invalid" }), context("status"))).status).toBe(400);
  expect((await POST(post("status", { clientSecret: secret, amount: 1 }), context("status"))).status).toBe(400);
  expect((await POST(post("intents", {}, "https://other.example"), context("intents"))).status).toBe(403);
  expect(Stripe).not.toHaveBeenCalled();
});

test("only exposes the intended methods and endpoints", async () => {
  expect((await GET(new Request("http://localhost/"), context("webhook"))).status).toBe(404);
  const wrongMethod = await GET(new Request("http://localhost/"), context("intents"));
  expect(wrongMethod.status).toBe(405);
  expect(wrongMethod.headers.get("allow")).toBe("POST");
  expect((await POST(post("config", {}), context("config"))).status).toBe(405);
  expect(Stripe).not.toHaveBeenCalled();
});

test("bounds and validates request bodies", async () => {
  expect((await POST(post("intents", { data: "a".repeat(1024) }), context("intents"))).status).toBe(413);
  expect((await POST(new Request("http://localhost/", { method: "POST", body: "{" }), context("intents"))).status).toBe(400);
  expect((await POST(post("intents", null), context("intents"))).status).toBe(400);
  expect(Stripe).not.toHaveBeenCalled();
});

test("rejects missing or live keys and invalid server prices without calling Stripe", async () => {
  for (const [key, value] of [
    ["STRIPE_SECRET_KEY", ""], ["STRIPE_SECRET_KEY", "sk_live_demo"],
    ["STRIPE_PUBLISHABLE_KEY", "pk_live_demo"],
    ...["", "0", "49", "1.5", "NaN", "100000000"].map((value) => ["STRIPE_DEMO_AMOUNT", value]),
  ]) {
    const previous = process.env[key];
    process.env[key] = value;
    expect((await POST(post("intents", {}), context("intents"))).status).toBe(503);
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  }
  expect(Stripe).not.toHaveBeenCalled();
});

test("handles Stripe failures and invalid intent responses without exposing secret details", async () => {
  createIntent.mockRejectedValueOnce(new Error("Stripe private details sk_test_demo"));
  const failed = await POST(post("intents", {}), context("intents"));
  expect(failed.status).toBe(503);
  expect(await failed.json()).toEqual({ error: "The payment service is unavailable. Please try again shortly." });
  for (const changed of [{ livemode: true }, { client_secret: null }]) {
    createIntent.mockResolvedValueOnce({ ...intent, ...changed });
    expect((await POST(post("intents", {}), context("intents"))).status).toBe(503);
  }
  retrieveIntent.mockRejectedValueOnce(new Error("Private Stripe details"));
  expect((await POST(post("status", { clientSecret: secret }), context("status"))).status).toBe(503);
});
