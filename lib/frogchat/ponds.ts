export const POND_IDS = ["classic", "woodland", "pixel"] as const;
export type PondId = typeof POND_IDS[number];
export const DEFAULT_POND: PondId = "classic";

export const PONDS = {
  classic: { name: "Clover pond", day: "Sunny pond", night: "Moonlit pond", description: "A familiar little place to just be.", style: "Original", symbol: "✳" },
  woodland: { name: "Whispering woods", day: "Sunlit woods", night: "Lantern woods", description: "Follow the breeze. There’s magic in the moss.", style: "Painted woodland", symbol: "❧" },
  pixel: { name: "Pixel springs", day: "Daylight springs", night: "Starlight springs", description: "A tiny adventure, one lily pad at a time.", style: "Pixel adventure", symbol: "✦" },
} as const;

export function isPondId(value: unknown): value is PondId {
  return POND_IDS.some(id => id === value);
}

export function nextPond(current: PondId, random = Math.random()): PondId {
  const choices = POND_IDS.filter(id => id !== current);
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random * choices.length)))];
}
