import type { BeanListing } from "./bean-prices";

export const BEAN_STORAGE_KEY = "coffee-bean-tracker-v1";
export type PriceObservation = { at: string; priceCents: number };
export type BeanTrackerState = { watched: string[]; history: Record<string, PriceObservation[]> };
export const emptyTracker = (): BeanTrackerState => ({ watched: [], history: {} });

export function readTracker(raw: string | null): BeanTrackerState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || !Array.isArray(value.watched) || !value.history || typeof value.history !== "object") return emptyTracker();
    const history: Record<string, PriceObservation[]> = {};
    for (const [id, points] of Object.entries(value.history)) {
      if (!Array.isArray(points)) continue;
      history[id] = points.filter((point): point is PriceObservation => !!point && typeof point.at === "string" &&
        Number.isFinite(Date.parse(point.at)) && Number.isSafeInteger(point.priceCents) && point.priceCents > 0).slice(-60);
    }
    return { watched: value.watched.filter((id: unknown): id is string => typeof id === "string"), history };
  } catch { return emptyTracker(); }
}

export function recordBeanPrices(state: BeanTrackerState, listings: BeanListing[]): BeanTrackerState {
  const history = { ...state.history };
  for (const listing of listings) {
    if (!listing.checkedAt) continue;
    for (const variant of listing.variants) {
      const key = `${listing.id}:${variant.id}`;
      const points = history[key] ?? [];
      // Only newer source snapshots count; repeated cached responses cannot distort history.
      if (points.length && Date.parse(points[points.length - 1].at) >= Date.parse(listing.checkedAt)) continue;
      history[key] = [...points, { at: listing.checkedAt, priceCents: variant.priceCents }].slice(-60);
    }
  }
  return { ...state, history };
}
