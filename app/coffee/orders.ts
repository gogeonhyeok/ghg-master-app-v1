export type OrderResult = { ok: boolean; message: string };

export type CoffeeOrder = {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  status: string;
  createdAt: string;
};

export type OrderPage = {
  orders: CoffeeOrder[];
  total: number;
  page: number;
  size: number;
};

export type OrderListResult =
  | { ok: true; data: OrderPage }
  | { ok: false; message: string };
