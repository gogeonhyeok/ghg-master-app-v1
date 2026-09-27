// Segar and Fajar listings checked on 2026-09-26; mall additions on 2026-09-27.
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
  {
    location: "Hillion Mall · 17 Petir Road, #B2-54",
    name: "Sukiya",
    detail: "Japanese gyudon beef rice bowls and set meals.",
    source: "https://www.hillionmall.com.sg/store-directory/",
  },
  {
    location: "Hillion Mall · 17 Petir Road, #B2-57/58",
    name: "Ayam Penyet President",
    detail: "Indonesian smashed fried chicken with rice and sambal.",
    source: "https://www.hillionmall.com.sg/store-listing/",
  },
  {
    location: "Hillion Mall · 17 Petir Road, #B1-65A",
    name: "4 Fingers Crispy Fried Chicken",
    detail: "Crispy fried chicken for a quick meal.",
    source: "https://www.hillionmall.com.sg/store-listing/",
  },
  {
    location: "Hillion Mall · 17 Petir Road, #B2-46A",
    name: "An Acai Affair",
    detail: "Acai bowls for a fruity snack or dessert.",
    source: "https://www.hillionmall.com.sg/store-listing/",
  },
  {
    location: "Bukit Panjang Plaza · 1 Jelebu Road, #03-09A",
    name: "Song Fa Bak Kut Teh",
    detail: "Peppery pork rib soup, braised dishes, and rice.",
    source: "https://membership.songfa.com.sg/offer/SONG-FA/Song-Fa-Membership-24331",
  },
  {
    location: "Bukit Panjang Plaza · 1 Jelebu Road, #01-69",
    name: "WOK HEY",
    detail: "Customisable wok-fried rice and noodles for takeaway.",
    source: "https://www.capitaland.com/sg/malls/bukitpanjangplaza/en/stores/wok-hey.html",
  },
];
