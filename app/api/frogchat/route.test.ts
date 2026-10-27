/** @jest-environment node */
import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { checkOrigin } from "../../../lib/frogchat/http";

jest.mock("server-only", () => ({}));
jest.mock("../../../lib/frogchat/realtime", () => ({
  publishPondChange: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  requireRealtimeConfiguration: jest.fn(),
}));

let GET: typeof import("./route").GET;
let POST: typeof import("./route").POST;
let DELETE: typeof import("./route").DELETE;

const environmentKeys = ["MONGODB_URI", "MONGODB_URL", "FROGCHAT_REDIS_URL", "REDIS_URL"] as const;
const previousEnvironment = environmentKeys.map(key => process.env[key]);
const url = "http://localhost/api/frogchat";
const messageId = "e3c9925f-3972-4239-ae89-99f7c479e312";
const shared = globalThis as typeof globalThis & { frogchatMemory?: unknown };

function post(body: unknown, token?: string, origin = "http://localhost") {
  return new Request(url, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  ({ GET, POST, DELETE } = await import("./route"));
  environmentKeys.forEach(key => delete process.env[key]);
  delete shared.frogchatMemory;
});
afterEach(() => {
  environmentKeys.forEach((key, index) => {
    if (previousEnvironment[index] === undefined) delete process.env[key];
    else process.env[key] = previousEnvironment[index];
  });
});

it("joins, sends a message, receives it from another visitor, and leaves", async () => {
  const response = await POST(post({ action: "join" }));
  expect(response.status).toBe(201);
  expect(response.headers.get("cache-control")).toBe("no-store");
  const first = await response.json();
  const second = await (await POST(post({ action: "join" }))).json();
  expect((await POST(post({ action: "message", text: "  hello frogs  ", requestId: messageId }, first.token))).status).toBe(200);
  const view = await GET(new Request(url, { headers: { Authorization: `Bearer ${second.token}` } }));
  expect((await view.json()).messages[0].text).toBe("hello frogs");
  expect((await DELETE(new Request(url, { method: "DELETE", headers: { Authorization: `Bearer ${first.token}` } }))).status).toBe(204);
  expect((await GET(new Request(url, { headers: { Authorization: `Bearer ${first.token}` } }))).status).toBe(401);
});

it.each(["", " ", "a".repeat(181)])("rejects an invalid croak: %p", async text => {
  expect((await POST(post({ action: "message", text, requestId: messageId }))).status).toBe(400);
});

it("rejects unauthenticated reads and messages and cross-origin writes", async () => {
  expect((await GET(new Request(url))).status).toBe(401);
  expect((await POST(post({ action: "message", text: "Hi", requestId: messageId }))).status).toBe(401);
  expect((await POST(post({ action: "join" }, undefined, "https://other-pond.example"))).status).toBe(403);
});

it("rejects malformed and oversized request bodies", async () => {
  expect((await POST(new Request(url, { method: "POST", body: "{" }))).status).toBe(400);
  expect((await POST(post({ action: "message", text: "a".repeat(5000), requestId: messageId }))).status).toBe(413);
  expect((await POST(post(null))).status).toBe(400);
});

it("accepts the browser’s Host when Next.js uses an internal request URL", async () => {
  const request = new Request(url, {
    method: "POST", headers: { Host: "127.0.0.1:3014", Origin: "http://127.0.0.1:3014", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "join" }),
  });
  expect((await POST(request)).status).toBe(201);
});

it("accepts Vercel dev's forwarded loopback host for HTTP and WebSocket requests", () => {
  const previous = process.env.NODE_ENV;
  try {
    Object.assign(process.env, { NODE_ENV: "development" });
    const request = new Request("http://localhost:50772/api/frogchat", {
      headers: { Host: "localhost:50772", "X-Forwarded-Host": "localhost:3000", Origin: "http://localhost:3000" },
    });
    expect(() => checkOrigin(request)).not.toThrow();
    expect(() => checkOrigin(request, true)).not.toThrow();
    const foreign = new Request(request, { headers: { ...Object.fromEntries(request.headers), Origin: "https://other-pond.example" } });
    expect(() => checkOrigin(foreign, true)).toThrow("Please send your croak from this pond.");
  } finally { Object.assign(process.env, { NODE_ENV: previous }); }
});

it.each(["development", "production"])("rejects untrusted forwarded hosts in %s", environment => {
  const previous = process.env.NODE_ENV;
  try {
    Object.assign(process.env, { NODE_ENV: environment });
    for (const forwardedHost of ["other-pond.example", "localhost:3000, other-pond.example"]) {
      const request = new Request(url, {
        headers: { Host: "localhost:50772", "X-Forwarded-Host": forwardedHost, Origin: "https://other-pond.example" },
      });
      expect(() => checkOrigin(request, true)).toThrow("Please send your croak from this pond.");
    }
    if (environment === "production") {
      const request = new Request(url, {
        headers: { Host: "localhost:50772", "X-Forwarded-Host": "localhost:3000", Origin: "http://localhost:3000" },
      });
      expect(() => checkOrigin(request, true)).toThrow("Please send your croak from this pond.");
    }
  } finally { Object.assign(process.env, { NODE_ENV: previous }); }
});

it("uses Vercel dev's public loopback host when the WebSocket proxy rewrites both host headers", () => {
  const previous = process.env.NODE_ENV;
  const previousUrl = process.env.VERCEL_URL;
  try {
    Object.assign(process.env, { NODE_ENV: "development", VERCEL_URL: "localhost:3000" });
    const request = new Request("http://[::1]:52009/api/frogchat/ws", {
      headers: { Host: "[::1]:52009", "X-Forwarded-Host": "[::1]:52009", Origin: "http://localhost:3000" },
    });
    expect(() => checkOrigin(request, true)).not.toThrow();
    const foreign = new Request(request, { headers: { ...Object.fromEntries(request.headers), Origin: "https://other-pond.example" } });
    expect(() => checkOrigin(foreign, true)).toThrow("Please send your croak from this pond.");
    Object.assign(process.env, { NODE_ENV: "production" });
    expect(() => checkOrigin(request, true)).toThrow("Please send your croak from this pond.");
  } finally {
    Object.assign(process.env, { NODE_ENV: previous });
    if (previousUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = previousUrl;
  }
});

it("validates pond selection and derives message rooms from the session", async () => {
  expect((await POST(post({ action: "join", pond: "missing" }))).status).toBe(400);
  const woods = await (await POST(post({ action: "join", pond: "woodland" }))).json();
  const pixel = await (await POST(post({ action: "join", pond: "pixel" }))).json();
  const sent = await POST(post({ action: "message", pond: "pixel", text: "In the woods", requestId: messageId }, woods.token));
  expect((await sent.json()).pond).toBe("woodland");
  const view = await GET(new Request(url, { headers: { Authorization: `Bearer ${pixel.token}` } }));
  expect((await view.json()).messages).toEqual([]);
});
