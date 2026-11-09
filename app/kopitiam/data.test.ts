/** @jest-environment node */
jest.mock("server-only", () => ({}));

import { getKopitiams, kopitiamEndpoint } from "./data";
import { datasetId, datasetUrl, kopitiamUrl, parseKopitiamQuery } from "./catalog";

const centre = { id: "1", name: "Adam Road Food Centre", address: "2 Adam Road, Singapore 289876", type: "hawker-centre",
  latitude: 1.32413, longitude: 103.81416, foodStalls: 32, marketStalls: 0, description: "A hawker centre.", status: "Existing", photoUrl: null };
const payload = { page: 1, size: 25, total: 1, coverage: "NEA hawker centres; excludes private coffeeshops and food courts.",
  source: { agency: "NEA", datasetId, url: datasetUrl }, kopitiams: [centre] };
const fetchMock = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });
function respond(body: unknown, ok = true) { fetchMock.mockResolvedValue({ ok, json: async () => body }); }

test("fetches uncached records from the expected Lambda endpoint", async () => {
  respond(payload);
  await expect(getKopitiams()).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith(`${kopitiamEndpoint}?page=1&size=25`, expect.objectContaining({
    cache: "no-store", headers: { Accept: "application/json" }, signal: expect.any(AbortSignal),
  }));
});

test("forwards only the hawker name parameter with encoding and pagination", async () => {
  const result = { ...payload, page: 2, size: 10, total: 11 };
  respond(result);
  await expect(getKopitiams(2, 10, '  Adam & "Market" + 新加坡  ')).resolves.toEqual(result);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get("name")).toBe('Adam & "Market" + 新加坡');
  expect(url.searchParams.has("entity_name")).toBe(false);
  expect(url.searchParams.get("page")).toBe("2");
  expect(url.searchParams.get("size")).toBe("10");
});

test("accepts null optional details, zero counts and empty result pages", async () => {
  const result = { ...payload, kopitiams: [{ ...centre, latitude: null, longitude: null, foodStalls: null, description: null, status: null }] };
  respond(result);
  await expect(getKopitiams()).resolves.toEqual(result);
  respond({ ...payload, total: 0, kopitiams: [] });
  await expect(getKopitiams()).resolves.toMatchObject({ total: 0, kopitiams: [] });
  respond({ ...payload, page: 99, kopitiams: [] });
  await expect(getKopitiams(99)).resolves.toMatchObject({ page: 99, kopitiams: [] });
});

test("omits blank searches and rejects oversized input before fetching", async () => {
  respond(payload);
  await getKopitiams(1, 25, "   ");
  expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has("name")).toBe(false);
  fetchMock.mockClear();
  await expect(getKopitiams(1, 25, "a".repeat(257))).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("handles HTTP, JSON and network failures", async () => {
  respond({ error: "Private AWS message" }, false);
  await expect(getKopitiams()).rejects.toThrow("Hawker centre data is unavailable.");
  fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
  await expect(getKopitiams()).rejects.toThrow();
  fetchMock.mockRejectedValue(new Error("Timeout"));
  await expect(getKopitiams()).rejects.toThrow("Timeout");
});

test.each([
  null, [], { ...payload, page: 2 }, { ...payload, size: 100 }, { ...payload, total: -1 }, { ...payload, total: "1" },
  { ...payload, total: 0 }, { ...payload, coverage: "" }, { ...payload, source: null },
  { ...payload, source: { ...payload.source, url: "javascript:private" } },
  { ...payload, source: { ...payload.source, datasetId: "wrong-dataset" } }, { ...payload, kopitiams: null },
  { ...payload, kopitiams: [{ ...centre, id: "" }] }, { ...payload, kopitiams: [{ ...centre, type: "coffeeshop" }] },
  { ...payload, kopitiams: [{ ...centre, latitude: 91 }] }, { ...payload, kopitiams: [{ ...centre, longitude: -181 }] },
  { ...payload, kopitiams: [{ ...centre, latitude: "1.3" }] }, { ...payload, kopitiams: [{ ...centre, latitude: NaN }] },
  { ...payload, kopitiams: [{ ...centre, foodStalls: -1 }] }, { ...payload, kopitiams: [{ ...centre, marketStalls: 1.5 }] },
  { ...payload, kopitiams: [{ ...centre, description: undefined }] }, { ...payload, total: 2, kopitiams: [centre, centre] },
])("rejects invalid API data %j", async (body) => {
  respond(body);
  await expect(getKopitiams()).rejects.toThrow();
});

test("normalizes query values, validates names, and builds search-preserving URLs", () => {
  expect(parseKopitiamQuery({ page: ["2", "3"], size: "101", name: "  Adam  " })).toEqual({
    page: 1, size: 25, name: "Adam", invalidSearch: false,
  });
  expect(parseKopitiamQuery({ page: "1000000", size: "100" })).toMatchObject({ page: 1_000_000, size: 100 });
  expect(parseKopitiamQuery({ name: ["Adam", "Market"] }).invalidSearch).toBe(true);
  expect(parseKopitiamQuery({ name: "a".repeat(257) }).invalidSearch).toBe(true);
  expect(parseKopitiamQuery({ name: "a".repeat(256) }).invalidSearch).toBe(false);
  expect(kopitiamUrl(2, 10, "Adam & Co")).toBe("/kopitiam?page=2&size=10&name=Adam+%26+Co");
});
