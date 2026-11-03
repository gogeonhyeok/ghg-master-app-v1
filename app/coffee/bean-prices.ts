export const beanRetailers = [
  { id: "ppp", name: "PPP Coffee", origin: "https://pppcoffee.com", collection: "beans" },
  { id: "common-man", name: "Common Man Coffee Roasters", origin: "https://commonmancoffeeroasters.com", collection: "signature-blend-without-capsule" },
] as const;

export const beanCatalog = [
  { retailerId: "ppp", handle: "nuts-bolts-2", name: "Nuts & Bolts" },
  { retailerId: "ppp", handle: "throwback", name: "Throwback" },
  { retailerId: "ppp", handle: "40-winks-decaf", name: "40 Winks Decaf" },
  { retailerId: "common-man", handle: "cmcr-espresso-blend", name: "CMCR Espresso Blend" },
  { retailerId: "common-man", handle: "lucky-basterd-blend", name: "Lucky Basterd Blend" },
] as const;

export type BeanVariant = { id: string; label: string; grams: number; priceCents: number; available: boolean };
export type BeanListing = {
  id: string;
  name: string;
  retailerId: string;
  retailer: string;
  url: string;
  checkedAt: string | null;
  variants: BeanVariant[];
};
export type BeanPriceResponse = { currency: "SGD"; listings: BeanListing[]; cacheSeconds: number };

export function pricePer100g(variant: BeanVariant) {
  return variant.priceCents / variant.grams;
}

export function formatSgd(price: number) {
  return `S$${price.toFixed(2)}`;
}

export function emptyListing(bean: typeof beanCatalog[number]): BeanListing {
  const retailer = beanRetailers.find((entry) => entry.id === bean.retailerId)!;
  return { id: `${bean.retailerId}:${bean.handle}`, name: bean.name, retailerId: retailer.id, retailer: retailer.name,
    url: `${retailer.origin}/products/${bean.handle}`, checkedAt: null, variants: [] };
}

export function normalizeBean(bean: typeof beanCatalog[number], raw: unknown, checkedAt: string): BeanListing {
  const listing = emptyListing(bean);
  if (!raw || typeof raw !== "object") return listing;
  const product = raw as Record<string, unknown>;
  if (!Array.isArray(product.variants)) return listing;
  const variants = product.variants.flatMap((rawVariant): BeanVariant[] => {
    if (!rawVariant || typeof rawVariant !== "object") return [];
    const variant = rawVariant as Record<string, unknown>;
    const options = [variant.option1, variant.option2, variant.option3].filter((value): value is string => typeof value === "string");
    if (!options.some((value) => /^whole beans?$/i.test(value.trim())) || options.some((value) => /corporate|subscription/i.test(value))) return [];
    const size = options.map((value) => value.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|g)$/i)).find(Boolean);
    const grams = size ? Number(size[1]) * (size[2].toLowerCase() === "kg" ? 1000 : 1) : 0;
    // The collection feed uses decimal dollars, unlike Shopify's single-product Ajax feed.
    if (typeof variant.price !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(variant.price)) return [];
    const priceCents = Math.round(Number(variant.price) * 100);
    if (!Number.isFinite(grams) || grams <= 0 || grams > 10000 || !Number.isSafeInteger(priceCents) || priceCents <= 0 ||
        !Number.isSafeInteger(variant.id) || typeof variant.available !== "boolean") return [];
    // Shipping weight is not the quantity of coffee in the bag.
    return [{ id: String(variant.id), label: options.filter((value) => !/^whole beans?$/i.test(value.trim())).join(" / "), grams, priceCents, available: variant.available }];
  }).sort((a, b) => a.grams - b.grams || a.priceCents - b.priceCents);
  return { ...listing, variants, checkedAt: variants.length ? checkedAt : null };
}
