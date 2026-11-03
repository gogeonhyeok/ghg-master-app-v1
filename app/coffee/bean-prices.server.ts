import { beanCatalog, beanRetailers, emptyListing, normalizeBean, type BeanPriceResponse } from "./bean-prices";

export const BEAN_CACHE_SECONDS = 3600;

async function fetchRetailerJson(url: string) {
  const response = await fetch(url, {
    next: { revalidate: BEAN_CACHE_SECONDS },
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "application/json" },
    redirect: "error",
  });
  if (!response.ok) throw new Error("Retailer unavailable");
  return { data: await response.json() as unknown, date: response.headers.get("date") };
}

export async function fetchBeanPrices(): Promise<BeanPriceResponse> {
  const groups = await Promise.all(beanRetailers.map(async (retailer) => {
    const beans = beanCatalog.filter((bean) => bean.retailerId === retailer.id);
    try {
      // Fixed public sources only. Currency is verified before any amounts are labelled SGD.
      const [catalog, cart] = await Promise.all([
        fetchRetailerJson(`${retailer.origin}/collections/${retailer.collection}/products.json?limit=30&currency=SGD`),
        fetchRetailerJson(`${retailer.origin}/cart.js?currency=SGD`),
      ]);
      if (!cart.data || typeof cart.data !== "object" || !("currency" in cart.data) || cart.data.currency !== "SGD" ||
          !catalog.data || typeof catalog.data !== "object" || !("products" in catalog.data) || !Array.isArray(catalog.data.products)) {
        throw new Error("Unsupported retailer data");
      }
      const products = catalog.data.products;
      // Cached responses retain their source Date header, so a refresh does not invent a new observation.
      const sourceTime = catalog.date ? Date.parse(catalog.date) : NaN;
      const checkedAt = new Date(Number.isFinite(sourceTime) ? sourceTime : Date.now()).toISOString();
      return beans.map((bean) => normalizeBean(bean, products.find((product) => product?.handle === bean.handle), checkedAt));
    } catch {
      return beans.map(emptyListing);
    }
  }));
  return { currency: "SGD", listings: groups.flat(), cacheSeconds: BEAN_CACHE_SECONDS };
}
