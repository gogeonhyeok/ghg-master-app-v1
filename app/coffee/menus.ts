export type Cafe = {
  slug: string;
  name: string;
  city: string | null;
  country: string | null;
  url: string;
};

export type CoffeeMenuItem = {
  restaurant: Cafe;
  category: string;
  name: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  description?: string | null;
};

export type CoffeeMenus = {
  items: CoffeeMenuItem[];
  count: number;
  cafes: Cafe[];
  coverage: string;
  source: { provider: string; url: string; retrievedAt: string };
};

export type CoffeeMenuResult =
  | { ok: true; data: CoffeeMenus }
  | { ok: false; message: string };
