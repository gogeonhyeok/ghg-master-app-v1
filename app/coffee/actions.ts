"use server";

import type { CoffeeOrder, OrderPage, OrderListResult, OrderResult } from "./orders";

const orderUrl = "https://vffz3e1r44.execute-api.ap-southeast-1.amazonaws.com/coffee/order";
const orderFailure = "We couldn’t confirm your order. Please check with the host before trying again.";

export async function placeOrder(formData: FormData): Promise<OrderResult> {
  const name = formData.get("customerName");
  const rawQuantity = formData.get("quantity");
  const quantity = typeof rawQuantity === "string" ? Number(rawQuantity) : NaN;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80 ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { ok: false, message: "Enter your name (up to 80 characters) and a quantity from 1 to 10." };
  }

  try {
    const response = await fetch(orderUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ customerName: name.trim(), quantity }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { ok: false, message: orderFailure };
    const result = await response.json();
    if (result?.ok !== true || typeof result.id !== "string" || !result.id || typeof result.message !== "string") {
      return { ok: false, message: orderFailure };
    }
    return { ok: true, message: result.message };
  } catch {
    return { ok: false, message: orderFailure };
  }
}

export async function listOrders(page = 1, size = 25): Promise<OrderListResult> {
  if (!Number.isInteger(page) || page < 1 || page > 1000000 ||
      !Number.isInteger(size) || size < 1 || size > 100) {
    return { ok: false, message: "Choose a valid order page and page size." };
  }
  try {
    const response = await fetch(`${orderUrl}?page=${page}&size=${size}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Order list unavailable");
    const data = await response.json();
    if (!isOrderPage(data) || data.page !== page || data.size !== size) {
      throw new Error("Invalid order list");
    }
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Couldn’t load received orders. Please refresh to try again." };
  }
}

function isOrderPage(value: unknown): value is OrderPage {
  if (!value || typeof value !== "object") return false;
  const data = value as OrderPage;
  return Number.isSafeInteger(data.total) && data.total >= 0 &&
    Number.isInteger(data.page) && Number.isInteger(data.size) &&
    Array.isArray(data.orders) && data.orders.every((order: CoffeeOrder) =>
      order && typeof order.id === "string" && typeof order.customerName === "string" &&
      typeof order.status === "string" && typeof order.createdAt === "string" &&
      Number.isFinite(Date.parse(order.createdAt)) && Array.isArray(order.items) &&
      order.items.every((item) => item && typeof item.name === "string" &&
        Number.isInteger(item.quantity) && item.quantity > 0));
}
