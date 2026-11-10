# Coffee orders and bean price tracker

## Coffee orders

The order form sends `POST` and the received-orders admin section sends `GET`
through Next.js server actions to
`https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/coffee/order`.
Coffee ordering no longer needs a MongoDB connection in the Next.js app.

POST sends only `{ customerName, quantity }` for Americano orders. The name is
trimmed and limited to 80 characters; quantity must be an integer from 1 to 10.
Requests time out after 15 seconds and are not retried automatically. If order
confirmation fails, check with the host before submitting again.

The admin section is intentionally visible alongside the customer form to
everyone who can access this testing page. It lists customer, items, status,
Singapore time and reference, with 25 orders per page. It loads on arrival,
supports manual refresh and pagination, and returns to the newest orders after
a successful submission. GET requests bypass caching. A failed refresh keeps
previously loaded orders visible.

## Cafe menus

`CoffeeMenuSection` loads `GET /coffee/menu` from the same Lambda through
`menu-actions.ts`, with a 25-second timeout and no Next.js caching. It lists all
returned drinks grouped by cafe, including category, description when provided,
price in the original currency, availability and links to the original menus.
The section loads on arrival, supports manual refresh, and keeps previously
loaded menus visible if a refresh fails. The API may reuse its own 60-second
cache. Coverage and the source retrieval time are shown with Menumigo attribution.

## Coffee bean price tracker

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
