import "server-only";
import { currencies, type UsdRates } from "./usd";

export const exchangeEndpoint = "https://api.frankfurter.dev/v2/rates?base=USD&quotes=SGD,KRW,TWD";

export function parseUsdRates(payload: unknown): UsdRates {
  if (!Array.isArray(payload) || payload.length !== currencies.length) throw new Error("Invalid exchange rates");
  const rates = {} as UsdRates;
  for (const row of payload) {
    if (!row || typeof row !== "object" || row.base !== "USD" || !currencies.includes(row.quote) ||
        typeof row.rate !== "number" || !Number.isFinite(row.rate) || row.rate <= 0 ||
        typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
        !Number.isFinite(Date.parse(row.date)) || new Date(row.date).toISOString().slice(0, 10) !== row.date ||
        Object.hasOwn(rates, row.quote)) throw new Error("Invalid exchange rate");
    rates[row.quote as keyof UsdRates] = { localPerUsd: row.rate, date: row.date };
  }
  return rates;
}

export async function getUsdRates(): Promise<UsdRates | null> {
  try {
    const response = await fetch(exchangeEndpoint, {
      headers: { Accept: "application/json" }, next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000),
    });
    return response.ok ? parseUsdRates(await response.json()) : null;
  } catch {
    return null;
  }
}
