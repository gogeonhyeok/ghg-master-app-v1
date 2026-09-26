// Listings checked against linked sources on 2026-09-26.
export type FoodOption = {
  location: string;
  name: string;
  detail: string;
  source: string;
};

export const foodOptions: FoodOption[] = [
  {
    location: "Segar · 485 Segar Road, #01-510",
    name: "Bread Garden",
    detail: "Cakes, tarts, cookies, and pastries.",
    source: "https://www.breadgarden.com.sg/pages/contact",
  },
  {
    location: "Fajar Shopping Centre · 445 Fajar Road, #01-540",
    name: "Mr Bean",
    detail: "Soy porridge and wholegrain mixed rice bowls.",
    source: "https://www.mrbean.com.sg/store-locator",
  },
  {
    location: "Fajar Shopping Centre · 445 Fajar Road, #01-522",
    name: "Swee Heng Bakery",
    detail: "Bakery treats and cakes for a snack or something sweet.",
    source: "https://www.foodpanda.sg/restaurant/cgx3/swee-heng-bakery-fajar-road",
  },
  {
    location: "Fajar Shopping Centre · 445 Fajar Road, #01-548",
    name: "An-Nur Shentonway Famous",
    detail: "Indian rojak, chicken or mutton biryani, and mee goreng.",
    source: "https://www.foodpanda.sg/restaurant/g4xh/an-nur-shentonway-famous-fajar-shopping-centre",
  },
  {
    location: "Fajar Shopping Centre",
    name: "Koufu",
    detail: "A food court stop for a kaya butter bun, eggs, and coffee or tea.",
    source: "https://www.koufu.com.sg/happening/promotions/",
  },
];

