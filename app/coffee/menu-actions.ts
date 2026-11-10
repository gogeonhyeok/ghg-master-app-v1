"use server";

import type { Cafe, CoffeeMenus, CoffeeMenuItem, CoffeeMenuResult } from "./menus";

const menuUrl = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/coffee/menu";

export async function getCoffeeMenus(): Promise<CoffeeMenuResult> {
  try {
    const response = await fetch(menuUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error("Coffee menus unavailable");
    const data = await response.json();
    if (!isCoffeeMenus(data)) throw new Error("Invalid coffee menus");
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Couldn’t load coffee menus. Please refresh to try again." };
  }
}

function isSourceUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).origin === "https://menumigo.com";
  } catch {
    return false;
  }
}

function isCafe(value: unknown): value is Cafe {
  if (!value || typeof value !== "object") return false;
  const cafe = value as Cafe;
  return typeof cafe.slug === "string" && typeof cafe.name === "string" &&
    (cafe.city === null || typeof cafe.city === "string") &&
    (cafe.country === null || typeof cafe.country === "string") && isSourceUrl(cafe.url);
}

function isCoffeeMenus(value: unknown): value is CoffeeMenus {
  if (!value || typeof value !== "object") return false;
  const data = value as CoffeeMenus;
  return Array.isArray(data.cafes) && data.cafes.every(isCafe) &&
    Array.isArray(data.items) && data.count === data.items.length &&
    data.items.every((item: CoffeeMenuItem) => item && isCafe(item.restaurant) &&
      data.cafes.some((cafe) => cafe.slug === item.restaurant.slug) &&
      typeof item.category === "string" && typeof item.name === "string" &&
      typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
      typeof item.currency === "string" && /^[A-Z]{3}$/.test(item.currency) &&
      typeof item.isAvailable === "boolean" &&
      (item.description == null || typeof item.description === "string")) &&
    typeof data.coverage === "string" && !!data.source &&
    typeof data.source.provider === "string" && isSourceUrl(data.source.url) &&
    typeof data.source.retrievedAt === "string" && Number.isFinite(Date.parse(data.source.retrievedAt));
}
