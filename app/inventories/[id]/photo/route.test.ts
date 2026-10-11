/** @jest-environment node */
jest.mock("../../data", () => ({ getInventoryPhoto: jest.fn() }));

import { getInventoryPhoto } from "../../data";
import { GET } from "./route";

const context = { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) };
beforeEach(() => jest.clearAllMocks());

test("serves the original bytes with an image MIME type", async () => {
  jest.mocked(getInventoryPhoto).mockResolvedValue({ bytes: new Uint8Array([0, 128, 255]), contentType: "image/jpeg" });
  const response = await GET(new Request("http://localhost/inventories/photo"), context);
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("image/jpeg");
  expect(response.headers.get("Content-Length")).toBe("3");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([0, 128, 255]);
});

test("returns 404 for an unavailable image", async () => {
  jest.mocked(getInventoryPhoto).mockResolvedValue(null);
  expect((await GET(new Request("http://localhost"), context)).status).toBe(404);
});

test("returns a safe 503 when the database is unavailable", async () => {
  jest.mocked(getInventoryPhoto).mockRejectedValue(new Error("private connection details"));
  const response = await GET(new Request("http://localhost"), context);
  expect(response.status).toBe(503);
  expect(await response.text()).toBe("");
});
