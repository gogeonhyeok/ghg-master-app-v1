import type { Complaint } from "./data";

// Fictional records used only by tests; never seeded into the live database.
export const sampleComplaints: Complaint[] = [
  { id: "sample-1", text: "Upstairs has opened a bowling alley. Apparently, business starts at midnight. #485SegarRoad #Noise", area: "Bukit Panjang", place: "485 Segar Road", topic: "Noise", createdAt: Date.parse("2026-11-09T23:40:00+08:00"), canDelete: false },
  { id: "sample-2", text: "Quite a strong rubbish smell near the lift lobby this morning. Hope the bin area can get a good wash. #FajarRoad #Smells", area: "Bukit Panjang", place: "Fajar Road", topic: "Smells", createdAt: Date.parse("2026-11-09T08:15:00+08:00"), canDelete: false },
  { id: "sample-3", text: "The common corridor lights keep flickering. A bit tricky for our older neighbours coming home at night. #SenjaRoad #SharedSpaces", area: "Bukit Panjang", place: "Senja Road", topic: "Shared spaces", createdAt: Date.parse("2026-11-08T19:20:00+08:00"), canDelete: false },
  { id: "sample-4", text: "Power went off during my work call. Anyone else in the area affected, or is it just my place? #Tampines #Blackout", area: "Tampines", place: "Tampines", topic: "Blackout", createdAt: Date.parse("2026-11-08T14:05:00+08:00"), canDelete: false },
  { id: "sample-5", text: "The upstairs chairs have more nightlife than I do. Felt pads, anyone? #Punggol #Noise", area: "Punggol", place: "Punggol", topic: "Noise", createdAt: Date.parse("2026-11-07T23:10:00+08:00"), canDelete: false },
  { id: "sample-6", text: "Bicycles are blocking the shared walkway at our condo. Can we leave enough space for wheelchairs and prams please? #Bedok #SharedSpaces", area: "Bedok", place: "Bedok", topic: "Shared spaces", createdAt: Date.parse("2026-11-07T18:30:00+08:00"), canDelete: false },
];

