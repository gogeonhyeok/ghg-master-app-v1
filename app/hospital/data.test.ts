/** @jest-environment node */
jest.mock("server-only", () => ({}));

import { getHospitals, hospitalEndpoint } from "./data";
import { hospitalUrl, parseHospitalQuery, websiteUrl } from "./catalog";
import { hospital, payload } from "./test-fixtures";

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalEndpoint = process.env.SINGAPORE_HOSPITAL_API_URL;
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); delete process.env.SINGAPORE_HOSPITAL_API_URL; });
afterAll(() => { global.fetch = originalFetch; if (originalEndpoint === undefined) delete process.env.SINGAPORE_HOSPITAL_API_URL; else process.env.SINGAPORE_HOSPITAL_API_URL = originalEndpoint; });
const respond = (body: unknown, ok = true) => fetchMock.mockResolvedValue({ ok, json: async () => body });

test("fetches the hospital Lambda endpoint without a browser-side request", async () => {
  respond(payload);
  await expect(getHospitals()).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith(`${hospitalEndpoint}?page=1&size=25`, expect.objectContaining({
    cache: "no-store", headers: { Accept: "application/json" }, signal: expect.any(AbortSignal),
  }));
});

test("encodes every allowed filter and supports a local backend override", async () => {
  process.env.SINGAPORE_HOSPITAL_API_URL = "http://localhost:8080/singapore/hospital";
  const filters = { q: '  A & "B" + 新加坡  ', name: "General", address: "Hospital Road", resource_id: "ignored" };
  respond({ ...payload, page: 2, size: 10, total: 11 });
  await getHospitals(2, 10, filters);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.origin).toBe("http://localhost:8080");
  expect(url.pathname).toBe("/singapore/hospital");
  for (const [key, value] of Object.entries(filters)) {
    if (key === "resource_id") expect(url.searchParams.has(key)).toBe(false);
    else expect(url.searchParams.get(key)).toBe(value.trim());
  }
  expect(url.searchParams.get("page")).toBe("2");
});

test("validates search values before fetching and omits blank filters", async () => {
  for (const filters of [{ q: "a".repeat(257) }, { name: "x".repeat(257) }, { address: "x".repeat(257) }]) {
    await expect(getHospitals(1, 25, filters)).rejects.toThrow("Invalid hospital search");
  }
  await expect(getHospitals(0)).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
  respond(payload);
  await getHospitals(1, 25, { q: "  ", name: "" });
  expect(fetchMock.mock.calls[0][0]).toBe(`${hospitalEndpoint}?page=1&size=25`);
});

test("accepts empty result pages and pages beyond the available results", async () => {
  respond({ ...payload, total: 0, hospitals: [] });
  await expect(getHospitals()).resolves.toMatchObject({ total: 0, hospitals: [] });
  respond({ ...payload, page: 99, hospitals: [] });
  await expect(getHospitals(99)).resolves.toMatchObject({ page: 99, total: 1 });
});

test.each([
  null, [], { ...payload, page: 2 }, { ...payload, size: 100 }, { ...payload, total: -1 }, { ...payload, total: "1" },
  { ...payload, total: 0 }, { ...payload, hospitals: null }, { ...payload, coverage: "" }, { ...payload, source: null },
  { ...payload, source: { ...payload.source, retrievedAt: "invalid" } },
  { ...payload, source: { ...payload.source, provider: "OpenStreetMap via Overpass" } },
  { ...payload, source: { ...payload.source, url: "javascript:private" } },
  { ...payload, source: { ...payload.source, url: "https://user:password@example.test/api/interpreter" } },
  { ...payload, hospitals: [{ ...hospital, id: "../private" }] },
  { ...payload, hospitals: [{ ...hospital, sourceUrl: "javascript:private" }] },
  { ...payload, hospitals: [{ ...hospital, name: null }] },
  { ...payload, hospitals: [{ ...hospital, address: "" }] },
  { ...payload, total: 2, hospitals: [hospital, hospital] },
])("rejects malformed API responses %j", async value => {
  respond(value);
  await expect(getHospitals()).rejects.toThrow();
});

test("propagates HTTP, JSON and timeout failures for the page error state", async () => {
  respond({ error: "private upstream details" }, false);
  await expect(getHospitals()).rejects.toThrow("Hospital data is unavailable.");
  fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
  await expect(getHospitals()).rejects.toThrow();
  fetchMock.mockRejectedValue(new Error("Timeout"));
  await expect(getHospitals()).rejects.toThrow("Timeout");
});

test("normalizes query input and keeps all filters in encoded navigation URLs", () => {
  const query = parseHospitalQuery({ page: ["2", "3"], size: "101", q: " general ", address: "Example & Co" });
  expect(query).toMatchObject({ page: 1, size: 25, filters: { q: "general", address: "Example & Co" }, invalidFields: [] });
  expect(hospitalUrl(2, 10, query.filters)).toBe("/hospital?page=2&size=10&q=general&address=Example+%26+Co");
  expect(parseHospitalQuery({ q: ["a", "b"], address: ["x", "y"] }).invalidFields).toEqual(["q", "address"]);
  expect(parseHospitalQuery({ address: "x".repeat(257) }).invalidFields).toEqual(["address"]);
  expect(parseHospitalQuery({ name: "x".repeat(256) }).invalidFields).toEqual([]);
});

test("allows only safe website links", () => {
  expect(websiteUrl("https://example.test/hospital")).toBe("https://example.test/hospital");
  for (const value of [null, "javascript:alert(1)", "data:text/html,test", "https://user:password@example.test", "/relative"]) expect(websiteUrl(value)).toBeNull();
});
