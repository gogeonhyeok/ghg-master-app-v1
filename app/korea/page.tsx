import type { Metadata } from "next";
import Destination, { type DestinationData } from "../../components/travel/Destination";

export const metadata: Metadata = {"title": "Korea | Elsewhere Travel", "description": "Palace courtyards in the morning. Neon streets after dark. Discover South Korea through its cities, coastal escapes, and tables made for sharing."};

const destination: DestinationData = {
  "slug": "korea",
  "name": "Korea",
  "local": "한국",
  "tagline": "Old soul. New energy.",
  "intro": "Palace courtyards in the morning. Neon streets after dark. Discover South Korea through its cities, coastal escapes, and tables made for sharing.",
  "mood": "PALACES / COASTLINES / LATE-NIGHT BITES",
  "placesTitle": "Four places. Many Koreas.",
  "places": [
    [
      "Seoul",
      "PALACES & CITY LIFE",
      "Explore Gyeongbokgung, browse neighbourhood cafés, and make an evening of the Han River."
    ],
    [
      "Busan",
      "A CITY BY THE SEA",
      "Pair Haeundae beach with the colourful lanes of Gamcheon Culture Village and a seafood-market wander."
    ],
    [
      "Gyeongju",
      "HISTORY AT A SLOWER PACE",
      "Visit Bulguksa Temple and discover the royal tombs and historic landscapes of the former Silla capital."
    ],
    [
      "Jeju Island",
      "VOLCANIC LANDSCAPES",
      "Make space for Seongsan Ilchulbong, coastal paths, and a slower island itinerary."
    ]
  ],
  "foods": [
    [
      "Bibimbap",
      "Rice, vegetables, and a colourful mix of toppings, stirred together with gochujang."
    ],
    [
      "Korean barbecue",
      "A shared table, sizzling grilled meat, and a spread of small side dishes."
    ],
    [
      "Tteokbokki",
      "Chewy rice cakes in a spicy sauce: a classic street-food stop."
    ],
    [
      "Bingsu",
      "Shaved ice with sweet toppings, made for a leisurely dessert break."
    ]
  ],
  "experiences": [
    [
      "Walk through royal history",
      "Build a Seoul morning around a palace and its surrounding streets."
    ],
    [
      "Follow the coast",
      "Swap the city rush for a beach walk in Busan or a coastal outing on Jeju."
    ],
    [
      "Make a market meal",
      "Browse food stalls, order something unfamiliar, and leave room for one more bite."
    ]
  ],
  "itinerary": [
    [
      "Days 1–3 / Seoul",
      "Palaces, neighbourhood walks, markets, and an evening beside the Han River."
    ],
    [
      "Days 4–5 / Gyeongju",
      "Slow down for temples, historic sites, and café stops."
    ],
    [
      "Days 6–7 / Busan",
      "Finish by the sea with beach time and seafood. Save Jeju for a longer trip or a separate island escape."
    ]
  ],
  "source": "https://english.visitkorea.or.kr/",
  "sourceName": "VISITKOREA"
};

export default function KoreaPage() {
  return <Destination data={destination} />;
}
