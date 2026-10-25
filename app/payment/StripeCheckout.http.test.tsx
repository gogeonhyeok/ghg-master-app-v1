/** @jest-environment-options {"url":"http://localhost/"} */
import { afterEach, expect, test } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { ExpressCheckoutElement } from "@stripe/react-stripe-js";
import StripeCheckout from "./StripeCheckout";

declare const jest: typeof import("@jest/globals").jest;
jest.mock("@stripe/stripe-js/pure", () => ({ loadStripe: jest.fn(async () => ({})) }));
jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({}),
  useElements: () => ({}),
  ExpressCheckoutElement: jest.fn(() => null),
  PaymentElement: ({ onReady, onChange }: { onReady: () => void; onChange: (event: { complete: boolean }) => void }) => (
    <button type="button" onClick={() => { onReady(); onChange({ complete: true }); }}>Enter test card</button>
  ),
}));

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test("HTTP localhost skips the HTTPS-only wallet iframe and keeps card checkout enabled", async () => {
  const response = (value: unknown) => ({ ok: true, json: async () => value }) as Response;
  global.fetch = jest.fn<typeof fetch>()
    .mockResolvedValueOnce(response({ publishableKey: "pk_test_demo" }))
    .mockResolvedValueOnce(response({ id: "pi_test123", clientSecret: "pi_test123_secret_demo", amount: 1000, currency: "sgd" }));
  render(<StripeCheckout dark />);
  fireEvent.click(screen.getByRole("button", { name: "Start test payment" }));
  fireEvent.click(await screen.findByRole("button", { name: "Enter test card" }));
  expect(ExpressCheckoutElement).not.toHaveBeenCalled();
  expect(screen.getByText(/Apple Pay and Google Pay need HTTPS/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Pay SGD.*in test mode/ })).toBeEnabled();
});
