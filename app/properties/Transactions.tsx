"use client";

import { useState } from "react";
import { formatPrice, propertyArea, providers, type PropertyTransaction } from "./catalog";
import { currencies, formatUsd, orderByUsd, priceInUsd, type PriceOrder, type UsdRates } from "./usd";

export default function Transactions({ items, month, rates }: { items: PropertyTransaction[]; month: string; rates: UsdRates | null }) {
  const [order, setOrder] = useState<PriceOrder>(rates ? "usd-asc" : "source");
  const rows = orderByUsd(items, rates, order);

  return <>
    <div>
      <p id="usd-sort-scope">Sorting applies to the records on this page. Each source is paginated separately.</p>
      <label>Sort loaded records
        <select value={order} onChange={(event) => setOrder(event.target.value as PriceOrder)} disabled={!rates} aria-describedby="usd-sort-scope">
          <option value="usd-asc">USD: low to high</option><option value="usd-desc">USD: high to low</option><option value="source">Source order</option>
        </select>
      </label>
    </div>
    {rates ? <details>
      <summary>USD estimates · Latest available exchange rates</summary>
      <p>Estimates use current reference rates, rather than rates on each transaction date. USD = local price ÷ local currency per USD.</p>
      <ul>{currencies.map((currency) => <li key={currency}>1 USD = {rates[currency].localPerUsd} {currency} · <time dateTime={rates[currency].date}>{rates[currency].date}</time></li>)}</ul>
      <a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Exchange rates from Frankfurter</a>
    </details> : <p role="status">USD conversion is temporarily unavailable. Original local prices are shown; USD sorting is disabled. Refresh to try again.</p>}
    <div role="region" aria-label="Property transaction results" tabIndex={0}>
      <table><caption>Property sales in Singapore, South Korea and Taiwan for {month}</caption>
        <thead><tr><th scope="col">Property / address</th><th scope="col">Market</th><th scope="col">Local sale price</th><th scope="col" aria-sort={rates && order === "usd-asc" ? "ascending" : rates && order === "usd-desc" ? "descending" : "none"}>Estimated USD</th><th scope="col">Transaction date</th><th scope="col">Area</th><th scope="col">Original record</th></tr></thead>
        <tbody>{rows.map((item) => {
          const usd = priceInUsd(item, rates);
          // Keep disclosures attached to the same transaction when rows are sorted.
          const index = items.indexOf(item);
          return <tr key={`${item.provider}-${index}`}>
            <th scope="row"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.address}, ${providers[item.provider].name}`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${item.address} on Google Maps (opens in a new tab)`}>{item.address}</a><span>{providers[item.provider].type}{typeof item.sourceData.flat_type === "string" ? ` · ${item.sourceData.flat_type}` : ""}</span></th>
            <td><span>{item.country}</span></td><td>{formatPrice(item)}</td>
            <td>{usd === null ? "—" : `≈ ${formatUsd(usd)}`}</td>
            <td><time dateTime={item.date}>{item.date}</time></td><td>{propertyArea(item)}</td>
            <td><details><summary>View record</summary><dl>{Object.entries(item.sourceData).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value === null || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl></details></td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </>;
}
