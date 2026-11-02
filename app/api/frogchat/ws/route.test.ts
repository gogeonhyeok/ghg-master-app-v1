/** @jest-environment node */
import { expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));

jest.mock("../../../../lib/frogchat/realtime", () => ({ requireRealtimeConfiguration: jest.fn() }));

import { GET } from "./route";

it("requires a same-origin WebSocket upgrade and reports an unsupported runtime", async () => {
  const url = "http://localhost/api/frogchat/ws";
  expect((await GET(new Request(url, { headers: { Origin: "http://localhost" } }))).status).toBe(426);
  expect((await GET(new Request(url, { headers: { Origin: "https://elsewhere.example", Upgrade: "websocket" } }))).status).toBe(403);
  expect((await GET(new Request(url, { headers: { Upgrade: "websocket" } }))).status).toBe(403);
  expect((await GET(new Request(url, { headers: { Host: "localhost:3010", Origin: "http://localhost:3010", Upgrade: "websocket" } }))).status).toBe(503);
});
