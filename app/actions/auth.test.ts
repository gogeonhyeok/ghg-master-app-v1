/** @jest-environment node */

import { isGoogleAuthConfigured, signIn, signOut } from "../../auth";
import { signInWithGoogle, signOutOfAccount } from "./auth";

jest.mock("../../auth", () => ({
  isGoogleAuthConfigured: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test("starts Google OAuth and returns to the home page", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(true);
  await signInWithGoogle();
  expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
});

test("does not start OAuth with missing server configuration", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(false);
  await signInWithGoogle();
  expect(signIn).not.toHaveBeenCalled();
});

test("clears the session through Auth.js and returns home", async () => {
  await signOutOfAccount();
  expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
});
