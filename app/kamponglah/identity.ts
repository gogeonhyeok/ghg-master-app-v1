import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { auth, isGoogleAuthConfigured } from "../../auth";

export type Resident = { ownerId: string; name: string | null };
export const RESIDENT_COOKIE = process.env.NODE_ENV === "production" ? "__Host-kamponglah-resident" : "kamponglah-resident";

export async function getResident(): Promise<Resident> {
  const session = isGoogleAuthConfigured() ? await auth() : null;
  const email = session?.user?.email?.trim().toLowerCase();
  if (email) return { ownerId: createHash("sha256").update(`google:${email}`).digest("hex"), name: session?.user?.name ?? null };
  const jar = await cookies();
  let token = jar.get(RESIDENT_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = randomBytes(32).toString("hex");
    jar.set(RESIDENT_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return { ownerId: createHash("sha256").update(`guest:${token}`).digest("hex"), name: null };
}
