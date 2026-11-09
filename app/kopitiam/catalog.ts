import { directoryUrl, parseDirectoryQuery } from "../_lib/singapore-directory";
export { maxPage } from "../_lib/singapore-directory";

export type KopitiamQuery = { page?: string | string[]; size?: string | string[]; name?: string | string[] };
export type HawkerCentre = {
  id: string; name: string; address: string; type: "hawker-centre";
  latitude: number | null; longitude: number | null; foodStalls: number | null; marketStalls: number | null;
  description: string | null; status: string | null; photoUrl: string | null;
};
export type KopitiamPage = {
  page: number; size: number; total: number; coverage: string;
  source: { agency: string; datasetId: string; url: string }; kopitiams: HawkerCentre[];
};
export const datasetId = "d_bda4baa634dd1cc7a6c7cad5f19e2d68";
export const datasetUrl = `https://data.gov.sg/datasets/${datasetId}/view`;

export function parseKopitiamQuery(query: KopitiamQuery) {
  const { search, ...pagination } = parseDirectoryQuery(query.page, query.size, query.name);
  return { ...pagination, name: search };
}

export function kopitiamUrl(page: number, size: number, name = "") {
  return directoryUrl("/kopitiam", page, size, "name", name);
}

export function mapUrl(centre: HawkerCentre) {
  if (centre.latitude === null || centre.longitude === null) return null;
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${centre.latitude},${centre.longitude}` })}`;
}
