import { fetchBeanPrices } from "../../../coffee/bean-prices.server";

export async function GET() {
  return Response.json(await fetchBeanPrices(), { headers: { "Cache-Control": "no-store" } });
}
