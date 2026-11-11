export type Topic = "Noise" | "Smells" | "Blackout" | "Shared spaces";
export type Place = { tag: string; label: string; area: string; lat: number; lng: number };
export type Complaint = {
  id: string;
  text: string;
  area: string | null;
  place: string | null;
  topic: Topic;
  createdAt: number;
  canDelete?: boolean;
  author?: string;
};

// Starter hints, not a complete address directory. Coordinates are approximate
// neighbourhood centres, never a resident's precise position or unit.
export const places: Place[] = [
  { tag: "485SegarRoad", label: "485 Segar Road", area: "Bukit Panjang", lat: 1.388, lng: 103.772 },
  { tag: "SegarRoad", label: "Segar Road", area: "Bukit Panjang", lat: 1.388, lng: 103.772 },
  { tag: "FajarRoad", label: "Fajar Road", area: "Bukit Panjang", lat: 1.385, lng: 103.771 },
  { tag: "SenjaRoad", label: "Senja Road", area: "Bukit Panjang", lat: 1.386, lng: 103.762 },
  { tag: "Tampines", label: "Tampines", area: "Tampines", lat: 1.354, lng: 103.945 },
  { tag: "Punggol", label: "Punggol", area: "Punggol", lat: 1.405, lng: 103.903 },
  { tag: "Sengkang", label: "Sengkang", area: "Sengkang", lat: 1.391, lng: 103.895 },
  { tag: "Woodlands", label: "Woodlands", area: "Woodlands", lat: 1.437, lng: 103.786 },
  { tag: "Yishun", label: "Yishun", area: "Yishun", lat: 1.430, lng: 103.835 },
  { tag: "ToaPayoh", label: "Toa Payoh", area: "Toa Payoh", lat: 1.334, lng: 103.849 },
  { tag: "JurongWest", label: "Jurong West", area: "Jurong West", lat: 1.350, lng: 103.720 },
  { tag: "Bedok", label: "Bedok", area: "Bedok", lat: 1.324, lng: 103.930 },
  { tag: "Bishan", label: "Bishan", area: "Bishan", lat: 1.351, lng: 103.849 },
  { tag: "MarineParade", label: "Marine Parade", area: "Marine Parade", lat: 1.303, lng: 103.907 },
];

export const topics: Topic[] = ["Noise", "Smells", "Blackout", "Shared spaces"];
export const topicTags: Record<Topic, string> = { Noise: "Noise", Smells: "Smells", Blackout: "Blackout", "Shared spaces": "SharedSpaces" };
export const topicSymbols: Record<Topic, string> = { Noise: "≋", Smells: "〰", Blackout: "ϟ", "Shared spaces": "▦" };

export function hashtags(text: string): string[] {
  return Array.from(text.matchAll(/#([\p{L}\p{N}_]+)/gu), (match) => match[1]);
}

const normalise = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function findPlaces(text: string): Place[] {
  const tags = new Set(hashtags(text).map(normalise));
  return places.filter((place) => tags.has(normalise(place.tag)));
}

export function suggestPlaces(query: string): Place[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return places.filter((place) => terms.every((term) => normalise(`${place.tag} ${place.label} ${place.area}`).includes(normalise(term)))).slice(0, 5);
}

export function hashtagAtCaret(text: string, caret: number) {
  const match = text.slice(0, caret).match(/(?:^|\s)#([^#\n]{0,50})$/u);
  if (!match) return null;
  const start = caret - match[1].length - 1;
  const remainder = text.slice(caret).match(/^[\p{L}\p{N}_]*/u)?.[0] ?? "";
  return { query: match[1], start, end: caret + remainder.length };
}

const topicPatterns: Record<Topic, RegExp> = {
  Noise: /noise|noisy|drill|loud|banging|dragging|renovat|music|shout/i,
  Smells: /smell|odour|odor|stink|rubbish|smoke|burning/i,
  Blackout: /black\s?out|power|electric|outage/i,
  "Shared spaces": /shared\s?spaces|corridor|lift|walkway|bicycle|litter|pest|leak|blocked/i,
};

export function detectTopics(text: string): Topic[] {
  return topics.filter((topic) => topicPatterns[topic].test(text));
}

export function nearestArea(latitude: number, longitude: number): string | null {
  // Refuse positions outside Singapore rather than choosing an arbitrary estate.
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 1.20 || latitude > 1.48 || longitude < 103.60 || longitude > 104.05) return null;
  return [...places].sort((a, b) => ((a.lat - latitude) ** 2 + (a.lng - longitude) ** 2) - ((b.lat - latitude) ** 2 + (b.lng - longitude) ** 2))[0].area;
}

export type RankedComplaint = Complaint & { reason: string };

export function searchComplaints<T extends Complaint>(complaints: T[], query: string): T[] {
  const terms = query.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? [];
  if (!terms.length) return complaints;
  return complaints.filter((post) => {
    const searchable = normalise(post.text.normalize("NFKC"));
    return terms.every((term) => searchable.includes(normalise(term)));
  });
}

export function rankComplaints(complaints: Complaint[], text: string, area: string | null, filter: Topic | "All"): RankedComplaint[] {
  const matchedPlaces = findPlaces(text);
  const selectedArea = matchedPlaces[0]?.area ?? area;
  const relatedTopics = detectTopics(text);
  const words = text.toLowerCase().replace(/#[\p{L}\p{N}_]+/gu, "").match(/[a-z]{4,}/g) ?? [];
  const ignored = new Set(["this", "that", "with", "have", "been", "from", "anyone", "else", "just", "near", "again", "there", "after", "about"]);
  return complaints.filter((post) => filter === "All" || post.topic === filter).map((post) => {
    const samePlace = matchedPlaces.some((place) => place.label === post.place);
    const sameArea = Boolean(selectedArea && post.area === selectedArea);
    const sameTopic = relatedTopics.includes(post.topic);
    const overlap = new Set(words.filter((word) => !ignored.has(word) && post.text.toLowerCase().includes(word))).size;
    return {
      post, score: (samePlace ? 100 : sameArea ? 60 : 0) + (sameTopic ? 25 : 0) + Math.min(overlap, 5) * 2,
      reason: samePlace ? "Same location tag" : sameArea ? "In your area" : sameTopic || overlap ? "Related to your post" : "Around Singapore",
    };
  }).sort((a, b) => b.score - a.score || b.post.createdAt - a.post.createdAt).map(({ post, reason }) => ({ ...post, reason }));
}
