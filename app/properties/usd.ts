import type { PropertyTransaction } from "./catalog";

export const currencies = ["SGD", "KRW", "TWD"] as const;
export type UsdRates = Record<(typeof currencies)[number], { localPerUsd: number; date: string }>;
export type PriceOrder = "usd-asc" | "usd-desc" | "source";

export function priceInUsd(item: PropertyTransaction, rates: UsdRates | null): number | null {
  const rate = rates?.[item.currency as keyof UsdRates]?.localPerUsd;
  if (!rate || !Number.isFinite(rate) || rate <= 0) return null;
  const usd = item.price / rate;
  return Number.isFinite(usd) ? usd : null;
}

export function orderByUsd(items: PropertyTransaction[], rates: UsdRates | null, order: PriceOrder) {
  if (order === "source" || !rates) return items;
  return [...items].sort((left, right) => {
    const a = priceInUsd(left, rates);
    const b = priceInUsd(right, rates);
    if (a === null) return b === null ? 0 : 1;
    if (b === null) return -1;
    return order === "usd-asc" ? a - b : b - a;
  });
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-SG", { style: "currency", currency: "USD", currencyDisplay: "code", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
