/** @jest-environment node */
jest.mock("server-only", () => ({}));

import { companiesEndpoint, getCompanies } from "./data";
import { companiesUrl, parseCompaniesQuery } from "./catalog";

const company = { uen: "202600001A", name: "EXAMPLE PTE. LTD.", status: "Registered", entityType: "Local Company", registrationDate: "2026-01-01", streetName: "EXAMPLE ROAD", postalCode: "012345" };
const payload = { page: 1, size: 25, total: 1, companies: [company] };
const fetchMock = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => { global.fetch = fetchMock; fetchMock.mockReset(); });
afterAll(() => { global.fetch = originalFetch; });

function respond(body: unknown, ok = true) { fetchMock.mockResolvedValue({ ok, json: async () => body }); }

test("uses the expected Lambda URL with server-side uncached requests", async () => {
  respond(payload);
  await expect(getCompanies()).resolves.toEqual(payload);
  expect(fetchMock).toHaveBeenCalledWith(`${companiesEndpoint}?page=1&size=25`, expect.objectContaining({ cache: "no-store", headers: { Accept: "application/json" }, signal: expect.any(AbortSignal) }));
});

test("sends pagination and preserves postal codes and nullable details", async () => {
  const result = { page: 2, size: 10, total: 11, companies: [{ ...company, streetName: null, registrationDate: null }] };
  respond(result);
  await expect(getCompanies(2, 10)).resolves.toEqual(result);
  expect(fetchMock.mock.calls[0][0]).toBe(`${companiesEndpoint}?page=2&size=10`);
});

test("encodes company-name search and trims it before forwarding to Lambda", async () => {
  respond(payload);
  await getCompanies(1, 25, '  DBS & "Partners" + 新加坡  ');
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get("entity_name")).toBe('DBS & "Partners" + 新加坡');
  expect(url.searchParams.get("page")).toBe("1");
  expect(url.searchParams.get("size")).toBe("25");
  expect(url.searchParams.has("name")).toBe(false);
});

test("omits blank search and rejects long searches before fetching", async () => {
  respond(payload);
  await getCompanies(1, 25, "   ");
  expect(new URL(fetchMock.mock.calls[0][0]).searchParams.has("entity_name")).toBe(false);
  fetchMock.mockClear();
  await expect(getCompanies(1, 25, "a".repeat(257))).rejects.toThrow();
  expect(fetchMock).not.toHaveBeenCalled();
});

test("parses search without silently truncating or accepting repeated names", () => {
  expect(parseCompaniesQuery({ entity_name: "  DBS  " })).toMatchObject({ entityName: "DBS", invalidSearch: false });
  expect(parseCompaniesQuery({ entity_name: ["DBS", "OCBC"] }).invalidSearch).toBe(true);
  expect(parseCompaniesQuery({ entity_name: "a".repeat(257) }).invalidSearch).toBe(true);
  expect(companiesUrl(2, 10, "DBS & Co")).toBe("/companies?page=2&size=10&entity_name=DBS+%26+Co");
});

test("accepts empty pages beyond the last result", async () => {
  const result = { page: 99, size: 25, total: 1, companies: [] };
  respond(result);
  await expect(getCompanies(99)).resolves.toEqual(result);
});

test("rejects upstream HTTP errors, malformed JSON, and network failures", async () => {
  respond({ error: "private backend message" }, false);
  await expect(getCompanies()).rejects.toThrow("Company data is unavailable.");
  fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
  await expect(getCompanies()).rejects.toThrow();
  fetchMock.mockRejectedValue(new Error("Network failure"));
  await expect(getCompanies()).rejects.toThrow("Network failure");
});

test.each([
  null, [], { ...payload, total: -1 }, { ...payload, total: "1" }, { ...payload, page: 2 }, { ...payload, size: 100 },
  { ...payload, companies: null }, { ...payload, total: 0 },
  { ...payload, companies: [{ ...company, postalCode: 12345 }] },
  { ...payload, companies: [{ ...company, uen: "" }] },
  { ...payload, companies: [{ ...company, registrationDate: undefined }] },
  { ...payload, total: 2, companies: [company, company] },
])("rejects invalid response %j", async (body) => {
  respond(body);
  await expect(getCompanies()).rejects.toThrow();
});

test.each([undefined, "", "0", "-1", "1.5", "1e2", "1000001", "9007199254740992", ["2", "3"]])("defaults invalid page %j", (page) => {
  expect(parseCompaniesQuery({ page })).toEqual({ page: 1, size: 25, entityName: "", invalidSearch: false });
});

test.each(["0", "101", "abc", ["10", "25"]])("defaults invalid size %j", (size) => {
  expect(parseCompaniesQuery({ page: "2", size })).toEqual({ page: 2, size: 25, entityName: "", invalidSearch: false });
});

test("accepts supported pagination bounds", () => {
  expect(parseCompaniesQuery({ page: "1000000", size: "100" })).toEqual({ page: 1000000, size: 100, entityName: "", invalidSearch: false });
});
