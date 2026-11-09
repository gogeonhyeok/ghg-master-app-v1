import { attribution, coverage, licenseUrl, sourceUrl, type Hospital, type HospitalsPage } from "./catalog";

export const hospital: Hospital = {
  id: "way/123", name: "Example General Hospital", operator: "Example Health", speciality: "general;cardiology",
  address: "1 Hospital Road Singapore 012345", houseNumber: "1", street: "Hospital Road", postalCode: "012345", city: "Singapore",
  latitude: 1.3, longitude: 103.8, emergency: "yes", wheelchair: "limited", phone: "+65 6123 4567",
  website: "https://example.test/hospital", openingHours: "24/7", osmUrl: "https://www.openstreetmap.org/way/123",
};
export const payload: HospitalsPage = {
  page: 1, size: 25, total: 1, coverage, hospitals: [hospital],
  source: { provider: "OpenStreetMap via Overpass", url: sourceUrl, attribution, license: "ODbL-1.0", licenseUrl, dataTimestamp: "2026-11-09T00:00:00Z" },
};
