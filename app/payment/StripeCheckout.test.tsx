/** @jest-environment-options {"url":"https://localhost/"} */
import { afterEach, beforeEach, expect, test } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { loadStripe } from "@stripe/stripe-js/pure";
import StripeCheckout from "./StripeCheckout";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";

declare const jest: typeof import("@jest/globals").jest;

const confirmPayment = jest.fn<(options: { elements: unknown; redirect: "if_required" }) => Promise<unknown>>();
const submitElements = jest.fn<() => Promise<{ error?: { message: string } }>>();
const walletResolve = jest.fn<() => void>();
const walletReject = jest.fn<() => void>();
const walletPaymentFailed = jest.fn<StripeExpressCheckoutElementConfirmEvent["paymentFailed"]>();
type WalletProps = React.ComponentProps<typeof import("@stripe/react-stripe-js").ExpressCheckoutElement>;
jest.mock("@stripe/stripe-js/pure", () => ({ loadStripe: jest.fn() }));
jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({ confirmPayment }),
  useElements: () => ({ testElements: true, submit: submitElements }),
  ExpressCheckoutElement: ({ onClick, onConfirm, onCancel, onReady, onAvailablePaymentMethodsChange, onLoadError }: WalletProps) => (
    <div>
      <button type="button" onClick={() => onAvailablePaymentMethodsChange?.({ elementType: "expressCheckout", paymentMethods: { applePay: { available: true }, googlePay: { available: true } } })}>Wallets available</button>
      <button type="button" onClick={() => onReady?.({ elementType: "expressCheckout", availablePaymentMethods: undefined })}>No wallets available</button>
      <button type="button" onClick={() => onLoadError?.({ elementType: "expressCheckout", error: { type: "api_connection_error" } })}>Wallet load failure</button>
      {(["apple_pay", "google_pay"] as const).map((expressPaymentType) => (
        <div key={expressPaymentType}>
          <button type="button" onClick={() => onClick?.({ elementType: "expressCheckout", expressPaymentType, resolve: walletResolve, reject: walletReject })}>Open {expressPaymentType}</button>
          <button type="button" onClick={() => onConfirm?.({ expressPaymentType, paymentFailed: walletPaymentFailed })}>Authorize {expressPaymentType}</button>
        </div>
      ))}
      <button type="button" onClick={() => onCancel?.({ elementType: "expressCheckout" })}>Cancel wallet</button>
    </div>
  ),
  PaymentElement: ({ onReady, onChange }: { onReady: () => void; onChange: (event: { complete: boolean }) => void }) => (
    <button type="button" onClick={() => { onReady(); onChange({ complete: true }); }}>Enter test card</button>
  ),
}));

const originalFetch = global.fetch;
const intent = { id: "pi_test123", clientSecret: "pi_test123_secret_demo", amount: 1000, currency: "sgd" };
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn<typeof fetch>()
    .mockResolvedValueOnce(response({ publishableKey: "pk_test_demo" }))
    .mockResolvedValueOnce(response(intent));
  jest.mocked(loadStripe).mockResolvedValue({} as Awaited<ReturnType<typeof loadStripe>>);
  confirmPayment.mockReset().mockResolvedValue({ paymentIntent: { id: intent.id } });
  submitElements.mockReset().mockResolvedValue({});
});
afterEach(() => { global.fetch = originalFetch; });

async function openCheckout() {
  render(<StripeCheckout dark />);
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  fireEvent.click(await screen.findByRole("button", { name: "Enter test card" }));
  return screen.getByRole("button", { name: /Pay SGD.*in test mode/ });
}

test("starts only on demand and creates one server-priced intent even on repeated clicks", async () => {
  render(<StripeCheckout dark={false} />);
  expect(fetch).not.toHaveBeenCalled();
  const start = screen.getByRole("button", { name: "Start test payment" });
  fireEvent.click(start);
  fireEvent.click(start);
  await screen.findByRole("button", { name: "Enter test card" });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenNthCalledWith(2, "/api/payments/stripe/intents", expect.objectContaining({ method: "POST", body: "{}" }));
  expect(screen.getByRole("button", { name: /Pay SGD/ })).toBeDisabled();
  expect(screen.queryByDisplayValue(intent.clientSecret)).not.toBeInTheDocument();
});

test("confirms through Stripe and shows success only after backend verification", async () => {
  const pay = await openCheckout();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }) as Response);
  fireEvent.click(pay);
  fireEvent.click(pay);
  expect(await screen.findByText("Test payment successful.")).toBeInTheDocument();
  expect(confirmPayment).toHaveBeenCalledTimes(1);
  expect(confirmPayment).toHaveBeenCalledWith({ elements: { testElements: true, submit: submitElements }, redirect: "if_required" });
  expect(fetch).toHaveBeenLastCalledWith("/api/payments/stripe/status", expect.objectContaining({
    method: "POST", body: JSON.stringify({ clientSecret: intent.clientSecret }), cache: "no-store",
  }));
  expect(screen.getByRole("button", { name: "Start another test payment" })).toBeInTheDocument();
});

test("a declined card can be retried on the same intent", async () => {
  const pay = await openCheckout();
  confirmPayment.mockResolvedValueOnce({ error: { type: "card_error", message: "Your card was declined." } });
  fireEvent.click(pay);
  expect(await screen.findByRole("alert")).toHaveTextContent("Your card was declined.");
  expect(pay).toBeEnabled();
  expect(fetch).toHaveBeenCalledTimes(2);
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }) as Response);
  fireEvent.click(pay);
  await screen.findByText("Test payment successful.");
  expect(confirmPayment).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("an uncertain confirmation is checked without confirming or creating another payment", async () => {
  const pay = await openCheckout();
  confirmPayment.mockRejectedValueOnce(new Error("Connection lost"));
  fireEvent.click(pay);
  expect(await screen.findByRole("alert")).toHaveTextContent("Check its status before paying again.");
  expect(pay).toBeDisabled();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }) as Response);
  fireEvent.click(screen.getByRole("button", { name: "Check payment status" }));
  await screen.findByText("Test payment successful.");
  expect(confirmPayment).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("processing stays pending and can be checked again", async () => {
  const pay = await openCheckout();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "processing", amount: 1000, currency: "sgd" }) as Response);
  fireEvent.click(pay);
  await screen.findByText(/Your payment is processing/);
  expect(screen.queryByText("Test payment successful.")).not.toBeInTheDocument();
  expect(pay).toBeDisabled();
  expect(screen.getByRole("button", { name: "Check payment status" })).toBeEnabled();
});

test("does not trust a backend result for another intent", async () => {
  const pay = await openCheckout();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: "pi_other", status: "succeeded", amount: 1000, currency: "sgd" }) as Response);
  fireEvent.click(pay);
  await screen.findByRole("alert");
  expect(screen.queryByText("Test payment successful.")).not.toBeInTheDocument();
  expect(pay).toBeDisabled();
});

test("shows disabled backend configuration without creating an intent", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValue(response({ error: "Stripe sandbox is disabled." }, false));
  render(<StripeCheckout dark />);
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Stripe sandbox is disabled.");
  expect(loadStripe).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("refuses live keys and allows retry when Stripe.js fails to load", async () => {
  global.fetch = jest.fn<typeof fetch>().mockResolvedValueOnce(response({ publishableKey: "pk_live_demo" }));
  render(<StripeCheckout dark />);
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  await screen.findByRole("alert");
  expect(loadStripe).not.toHaveBeenCalled();
  jest.mocked(fetch).mockResolvedValueOnce(response({ publishableKey: "pk_test_demo" }) as Response);
  jest.mocked(loadStripe).mockRejectedValueOnce(new Error("Stripe could not load."));
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Stripe could not load."));
  expect(fetch).toHaveBeenCalledTimes(2);
});

test.each(["apple_pay", "google_pay"])("confirms %s without requiring the card form to be complete", async (wallet) => {
  render(<StripeCheckout dark />);
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  await screen.findByRole("button", { name: "Enter test card" });
  fireEvent.click(screen.getByRole("button", { name: "Wallets available" }));
  expect(screen.getByText("Or pay by card")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Pay SGD/ })).toBeDisabled();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }));
  fireEvent.click(screen.getByRole("button", { name: `Open ${wallet}` }));
  expect(walletResolve).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: `Authorize ${wallet}` }));
  await screen.findByText("Test payment successful.");
  expect(submitElements).toHaveBeenCalledTimes(1);
  expect(confirmPayment).toHaveBeenCalledTimes(1);
  expect(walletPaymentFailed).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("canceling the wallet sheet restores the card option without creating another intent", async () => {
  const pay = await openCheckout();
  fireEvent.click(screen.getByRole("button", { name: "Open google_pay" }));
  expect(pay).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Open apple_pay" }));
  expect(walletReject).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Cancel wallet" }));
  expect(pay).toBeEnabled();
  expect(confirmPayment).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test("card checkout remains available when wallets cannot render", async () => {
  const pay = await openCheckout();
  fireEvent.click(screen.getByRole("button", { name: "No wallets available" }));
  expect(screen.getByText(/Apple Pay and Google Pay need HTTPS/)).toBeInTheDocument();
  expect(pay).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Wallets available" }));
  expect(screen.queryByText(/Apple Pay and Google Pay need HTTPS/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Wallet load failure" }));
  expect(screen.getByText(/Apple Pay and Google Pay need HTTPS/)).toBeInTheDocument();
  expect(pay).toBeEnabled();
});

test("wallet validation errors can fall back to the card on the same intent", async () => {
  const pay = await openCheckout();
  submitElements.mockResolvedValueOnce({ error: { message: "Wallet validation failed." } });
  fireEvent.click(screen.getByRole("button", { name: "Open google_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize google_pay" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Wallet validation failed.");
  expect(walletPaymentFailed).toHaveBeenCalledWith({ reason: "fail", message: "Wallet validation failed." });
  expect(confirmPayment).not.toHaveBeenCalled();
  expect(pay).toBeEnabled();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }));
  fireEvent.click(pay);
  await screen.findByText("Test payment successful.");
  expect(confirmPayment).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("a wallet decline can be retried without creating another payment", async () => {
  const pay = await openCheckout();
  confirmPayment.mockResolvedValueOnce({ error: { type: "card_error", message: "Wallet card was declined." } });
  fireEvent.click(screen.getByRole("button", { name: "Open apple_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize apple_pay" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Wallet card was declined.");
  expect(walletPaymentFailed).toHaveBeenCalledWith({ reason: "fail", message: "Wallet card was declined." });
  expect(pay).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Open google_pay" }));
  expect(walletResolve).toHaveBeenCalledTimes(2);
  expect(walletReject).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(2);
});

test("an uncertain wallet confirmation blocks both methods until status is checked", async () => {
  const pay = await openCheckout();
  confirmPayment.mockRejectedValueOnce(new Error("Connection lost"));
  fireEvent.click(screen.getByRole("button", { name: "Open google_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize google_pay" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Check its status before paying again.");
  expect(pay).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Open apple_pay" }));
  expect(walletReject).toHaveBeenCalledTimes(1);
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }));
  fireEvent.click(screen.getByRole("button", { name: "Check payment status" }));
  await screen.findByText("Test payment successful.");
  expect(confirmPayment).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("duplicate wallet authorization and card submission cannot confirm concurrently", async () => {
  const pay = await openCheckout();
  let finishConfirmation!: (value: unknown) => void;
  confirmPayment.mockImplementationOnce(() => new Promise((resolve) => { finishConfirmation = resolve; }));
  fireEvent.click(screen.getByRole("button", { name: "Open google_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize google_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize google_pay" }));
  fireEvent.click(pay);
  await waitFor(() => expect(confirmPayment).toHaveBeenCalledTimes(1));
  expect(submitElements).toHaveBeenCalledTimes(1);
  expect(walletPaymentFailed).not.toHaveBeenCalled();
  jest.mocked(fetch).mockResolvedValueOnce(response({ id: intent.id, status: "succeeded", amount: 1000, currency: "sgd" }));
  finishConfirmation({ paymentIntent: { id: intent.id } });
  await screen.findByText("Test payment successful.");
  expect(confirmPayment).toHaveBeenCalledTimes(1);
});

test("a status outage after wallet confirmation does not report a wallet decline", async () => {
  const pay = await openCheckout();
  jest.mocked(fetch).mockRejectedValueOnce(new Error("Status unavailable"));
  fireEvent.click(screen.getByRole("button", { name: "Open apple_pay" }));
  fireEvent.click(screen.getByRole("button", { name: "Authorize apple_pay" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Check its status before paying again.");
  expect(walletPaymentFailed).not.toHaveBeenCalled();
  expect(pay).toBeDisabled();
  expect(screen.getByRole("button", { name: "Check payment status" })).toBeEnabled();
});
