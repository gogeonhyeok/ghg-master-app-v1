import { sampleComplaints } from "./fixtures";
import { detectTopics, findPlaces, hashtagAtCaret, nearestArea, rankComplaints, searchComplaints, suggestPlaces } from "./data";

test("matches partial, spaced address hints and complete case-insensitive hashtags", () => {
  expect(suggestPlaces("485 segar")[0].tag).toBe("485SegarRoad");
  expect(suggestPlaces("bukit panjang")).toHaveLength(4);
  expect(findPlaces("Loud drilling #485segarroad #Noise")[0].area).toBe("Bukit Panjang");
  expect(suggestPlaces("Unknown estate")).toEqual([]);
  const draft = "Drilling #485 segar";
  expect(hashtagAtCaret(draft, draft.length)).toEqual({ query: "485 segar", start: 9, end: draft.length });
  expect(hashtagAtCaret("hello@example.com", 17)).toBeNull();
});

test("prioritises the exact hashtag, then its area, overriding browser location", () => {
  const result = rankComplaints(sampleComplaints, "#485SegarRoad #Blackout", "Tampines", "All");
  expect(result[0].id).toBe("sample-1");
  expect(result[0].reason).toBe("Same location tag");
  expect(result.slice(0, 3).every((post) => post.area === "Bukit Panjang")).toBe(true);
});

test("ranks related topics without location and preserves filtering and recency fallback", () => {
  const result = rankComplaints(sampleComplaints, "power outage", null, "All");
  expect(result[0].topic).toBe("Blackout");
  expect(result[0].reason).toBe("Related to your post");
  expect(rankComplaints(sampleComplaints, "", null, "Noise")).toHaveLength(2);
  expect(rankComplaints(sampleComplaints, "", null, "All")[0].id).toBe("sample-1");
  expect(detectTopics("noisy drilling and a strange smell")).toEqual(["Noise", "Smells"]);
});

test("maps approximate Singapore positions and refuses invalid or overseas positions", () => {
  expect(nearestArea(1.388, 103.772)).toBe("Bukit Panjang");
  expect(nearestArea(1.354, 103.945)).toBe("Tampines");
  expect(nearestArea(51.5, -0.1)).toBeNull();
  expect(nearestArea(NaN, 103.8)).toBeNull();
});

test("searches body text and hashtags together, ignoring case and optional hash marks", () => {
  expect(searchComplaints(sampleComplaints, "bowling").map((post) => post.id)).toEqual(["sample-1"]);
  expect(searchComplaints(sampleComplaints, "#tAMPINES").map((post) => post.id)).toEqual(["sample-4"]);
  expect(searchComplaints(sampleComplaints, "power #Tampines").map((post) => post.id)).toEqual(["sample-4"]);
  expect(searchComplaints(sampleComplaints, "485 segar road").map((post) => post.id)).toEqual(["sample-1"]);
  expect(searchComplaints(sampleComplaints, "#SharedSpaces")).toHaveLength(2);
  expect(searchComplaints(sampleComplaints, "power #Bedok")).toEqual([]);
  expect(searchComplaints(sampleComplaints, "   ")).toBe(sampleComplaints);
});
