"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { listOrders } from "./actions";
import type { OrderPage } from "./orders";
import styles from "./coffee.module.css";

export default function AdminOrders() {
  const [data, setData] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);

  const loadPage = useCallback(async (page: number) => {
    const currentRequest = ++request.current;
    setLoading(true);
    setError("");
    try {
      const result = await listOrders(page);
      if (request.current !== currentRequest) return;
      if (result.ok) setData(result.data);
      else setError(result.message);
    } catch {
      if (request.current === currentRequest) setError("Couldn’t load received orders. Please refresh to try again.");
    } finally {
      if (request.current === currentRequest) setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => { void loadPage(1); });
    return () => { request.current++; };
  }, [loadPage]);

  const pageCount = data ? Math.min(1000000, Math.max(1, Math.ceil(data.total / data.size))) : 1;

  return (
    <section className={styles.adminOrders} aria-labelledby="admin-orders-title" aria-busy={loading}>
      <header>
        <div>
          <p className={styles.eyebrow}>Admin · Testing environment</p>
          <h2 id="admin-orders-title">Received orders</h2>
          <p>Shared with everyone on this test page. Newest orders appear first.</p>
        </div>
        <button type="button" disabled={loading} onClick={() => startTransition(() => { void loadPage(data?.page ?? 1); })}>
          {loading ? "Loading orders…" : "Refresh orders"}
        </button>
      </header>
      <p role="status" className={error ? styles.orderError : undefined}>
        {error ? `${error}${data ? " Previously loaded orders remain below." : ""}` :
          loading ? "Loading received orders…" : `${data?.total ?? 0} received orders`}
      </p>
      {data && (data.orders.length ? (
        <div className={styles.orderTable} tabIndex={0} role="region" aria-label="Received orders table">
          <table>
            <caption>Received coffee orders · Times in Singapore (SGT)</caption>
            <thead><tr><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Status</th><th scope="col">Received</th><th scope="col">Reference</th></tr></thead>
            <tbody>{data.orders.map((order) => (
              <tr key={order.id}>
                <td>{order.customerName}</td>
                <td>{order.items.map((item, index) => <div key={index}>{item.quantity} × {item.name}</div>)}</td>
                <td>{order.status}</td>
                <td><time dateTime={order.createdAt}>{new Intl.DateTimeFormat("en-SG", {
                  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Singapore",
                }).format(new Date(order.createdAt))}</time></td>
                <td><code>{order.id}</code></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p>{data.total ? "No orders on this page. Go back or refresh page one." : "No orders received yet. Place the first order above."}</p>)}
      {data && <nav aria-label="Order pages">
        <button type="button" disabled={loading || data.page <= 1} onClick={() => startTransition(() => { void loadPage(data.page - 1); })}>Previous</button>
        <span>Page {data.page} of {pageCount}</span>
        <button type="button" disabled={loading || data.page >= pageCount} onClick={() => startTransition(() => { void loadPage(data.page + 1); })}>Next</button>
        {data.page > 1 && <button type="button" disabled={loading} onClick={() => startTransition(() => { void loadPage(1); })}>Newest orders</button>}
      </nav>}
    </section>
  );
}
