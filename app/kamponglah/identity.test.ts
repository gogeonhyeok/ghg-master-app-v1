/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("../../auth", () => ({ auth: jest.fn(), isGoogleAuthConfigured: jest.fn() }));
import { cookies } from "next/headers";
import { auth, isGoogleAuthConfigured } from "../../auth";
import { getResident, RESIDENT_COOKIE } from "./identity";

beforeEach(() => jest.clearAllMocks());

test("uses an authenticated Google identity across devices and never exposes the email as owner ID", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(true);
  jest.mocked(auth).mockResolvedValue({ user: { email: "Alex@Example.test", name: "Alex Tan" } } as never);
  const first = await getResident();
  jest.mocked(auth).mockResolvedValue({ user: { email: "alex@example.test", name: "New display name" } } as never);
  expect((await getResident()).ownerId).toBe(first.ownerId);
  expect(first.ownerId).toMatch(/^[a-f0-9]{64}$/);
  expect(cookies).not.toHaveBeenCalled();
});

test("assigns a private guest cookie, preserves it, and replaces malformed cookies", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(false);
  let value: string | undefined;
  const jar = { get: jest.fn(() => value ? { value } : undefined), set: jest.fn((_key, token) => { value = token; }) };
  jest.mocked(cookies).mockResolvedValue(jar as never);
  const first = await getResident();
  expect(jar.set).toHaveBeenCalledWith(RESIDENT_COOKIE, expect.stringMatching(/^[a-f0-9]{64}$/), expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }));
  expect(await getResident()).toEqual(first);
  expect(jar.set).toHaveBeenCalledTimes(1);
  value = "forged-owner-id";
  expect((await getResident()).ownerId).not.toBe(first.ownerId);
  expect(jar.set).toHaveBeenCalledTimes(2);
  expect(auth).not.toHaveBeenCalled();
});
