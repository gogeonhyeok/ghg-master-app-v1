# Coffee bean price tracker

`page.tsx` and `BeanPriceTracker.tsx` use semantic elements and accessible
attributes without `className` props. Their tag selectors live in `coffee.module.css`,
scoped by the CSS Module ID on the page's `<main>` element (`main#coffeePage`).
Named sections isolate the glossary, live drink picks and bean tracker styles;
category buttons use `aria-pressed` for their selected state. `OrderSection`
retains its existing component classes.

The coffee page compares one-off, whole-bean listings from PPP Coffee and
Common Man Coffee Roasters in SGD. `/api/coffee/bean-prices` reads each retailer's
public collection JSON feed and checks its public cart currency. No API keys or
customer accounts are needed. Sources are fixed in `bean-prices.ts`; the endpoint
does not accept arbitrary retailer URLs.

Upstream responses are cached by Next.js for one hour and have a ten-second
timeout. A refresh reads the latest available cached listings, rather than
forcing a retailer request. Source response dates identify observations, so
reading the same cached prices does not create duplicate history points.
Unavailable or rate-limited retailers show no quote; other retailers still load.

The adapter reads coffee weight from explicit size options such as `250g` or
`1kg`, never from shipping weight. It excludes ground, corporate and subscription
variants and computes SGD/100g from the selected bag's price and coffee weight.
Shipping, checkout discounts and subscription prices are excluded.

The watchlist and up to 60 observations per product variant stay in this browser
under `coffee-bean-tracker-v1`. Observations accumulate on visits or refreshes.
There is no background polling, historical backfill, shared database or alert
service. Clearing browser storage clears the saved tracker.

To add a bean, add its retailer ID, exact product handle and display name to
`beanCatalog`. Its handle must appear in the configured collection feed. Retailer
storefront feeds can change; treat this integration as best-effort and confirm
the current price on the linked product page.

Sources: [PPP Coffee](https://pppcoffee.com/collections/beans),
[Common Man](https://commonmancoffeeroasters.com/collections/signature-blend-without-capsule).
Shopify's [Ajax Product API](https://shopify.dev/docs/api/ajax/reference/product)
uses integer subunits for individual product requests; the collection feed used
here returns decimal price strings. These formats must not be interchanged.

Run `npm test -- --runInBand --watchman=false app/coffee` for tracker and order checks.
