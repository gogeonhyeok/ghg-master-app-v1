import { auth, isGoogleAuthConfigured } from "../../auth";
import KamponglahPage from "./page";

jest.mock("../../auth", () => ({ auth: jest.fn(), isGoogleAuthConfigured: jest.fn() }));
jest.mock("./Kamponglah", () => jest.fn());

beforeEach(() => jest.clearAllMocks());

test("passes only the authenticated display name from the existing Google session", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(true);
  jest.mocked(auth).mockResolvedValue({ user: { name: "Alex Tan", email: "alex@example.test", image: "https://example.test/avatar.png" } } as never);
  expect((await KamponglahPage()).props).toEqual({ userName: "Alex Tan" });
});

test("keeps guest posting available when Google auth is unconfigured", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(false);
  expect((await KamponglahPage()).props).toEqual({ userName: null });
  expect(auth).not.toHaveBeenCalled();
});

test("treats absent sessions or missing display names as anonymous without exposing email", async () => {
  jest.mocked(isGoogleAuthConfigured).mockReturnValue(true);
  jest.mocked(auth).mockResolvedValue(null as never);
  expect((await KamponglahPage()).props).toEqual({ userName: null });
  jest.mocked(auth).mockResolvedValue({ user: { email: "alex@example.test" } } as never);
  expect((await KamponglahPage()).props).toEqual({ userName: null });
});
