import { coverage, sourceUrl, type Hospital, type HospitalsPage } from "./catalog";

export const hospital: Hospital = {
  id: "sgh", name: "SINGAPORE GENERAL HOSPITAL", address: "Outram Road Singapore 169608",
  sourceUrl: "https://www.sgdi.gov.sg/ministries/moh/others/sgh",
};
export const payload: HospitalsPage = {
  page: 1, size: 25, total: 1, coverage, hospitals: [hospital],
  source: { provider: "Singapore Government Directory", url: sourceUrl, retrievedAt: "2026-11-09T00:00:00Z" },
};
