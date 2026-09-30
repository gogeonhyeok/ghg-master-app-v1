"use client";

import { useRef, useState, type FormEvent } from "react";
import { placeOrder } from "./actions";
import styles from "./coffee.module.css";

export default function OrderSection() {
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    submitting.current = true;
    setPending(true);
    setResult(null);
    try {
      const response = await placeOrder(new FormData(form));
      setResult(response);
      if (response.ok) form.reset();
    } catch {
      setResult({ ok: false, message: "We couldn’t confirm your order. Please check with the host before trying again." });
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section className={styles.orderSection} aria-labelledby="order-title">
      <p className={styles.eyebrow}>Free coffee from home</p>
      <h2 id="order-title">Order an Americano.</h2>
      <p>Espresso and hot water. One simple menu, made for you — on the house.</p>
      <form className={styles.orderForm} onSubmit={submit} aria-busy={pending}>
        <label>Your name<input name="customerName" autoComplete="name" required maxLength={80} disabled={pending} placeholder="Name for your order" /></label>
        <label>Quantity<input name="quantity" type="number" inputMode="numeric" required min={1} max={10} step={1} defaultValue={1} disabled={pending} /></label>
        <button type="submit" disabled={pending}>{pending ? "Placing order…" : "Place order"}</button>
      </form>
      <p role="status" aria-live="polite" className={result && !result.ok ? styles.orderError : undefined}>{result?.message}</p>
    </section>
  );
}
