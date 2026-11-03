"use server";

import { isGoogleAuthConfigured, signIn, signOut } from "../../auth";

export async function signInWithGoogle() {
  if (!isGoogleAuthConfigured()) return;
  await signIn("google", { redirectTo: "/" });
}

export async function signOutOfAccount() {
  await signOut({ redirectTo: "/" });
}
