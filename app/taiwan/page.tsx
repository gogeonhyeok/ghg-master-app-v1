import type { Metadata } from "next";
import Destination, { type DestinationData } from "../../components/travel/Destination";

export const metadata: Metadata = {"title": "Taiwan | Elsewhere Travel", "description": "Follow a lantern-lit lane, linger over tea, and let dinner become a night-market adventure. Taiwan invites you to explore one delicious detour at a time."};

const destination: DestinationData = {
  "slug": "taiwan",
  "name": "Taiwan",
  "local": "台灣",
  "tagline": "Small island. Endless detours.",
  "intro": "Follow a lantern-lit lane, linger over tea, and let dinner become a night-market adventure. Taiwan invites you to explore one delicious detour at a time.",
  "mood": "TEA / OLD STREETS / MOUNTAIN AIR",
  "placesTitle": "Cities, hills, and a lakeside pause.",
  "places": [
    [
      "Taipei",
      "URBAN ENERGY",
      "See Taipei 101, wander Dadaocheng, and build an evening around a night market."
    ],
    [
      "Tainan",
      "TEMPLES & LOCAL FLAVOURS",
      "Discover historic streets, temple courtyards, and a city that rewards a curious appetite."
    ],
    [
      "Kaohsiung",
      "HARBOUR & CREATIVITY",
      "Explore the Pier-2 Art Center and make time for a relaxed harbour-side walk."
    ],
    [
      "Sun Moon Lake",
      "A SCENIC ESCAPE",
      "Head to Nantou for lakeside views, cycling routes, and a change of pace from the city."
    ]
  ],
  "foods": [
    [
      "Beef noodle soup",
      "A comforting bowl of noodles, beef, and richly flavoured broth."
    ],
    [
      "Lu rou fan",
      "Braised pork over rice: a small bowl with plenty of character."
    ],
    [
      "Bubble tea",
      "Tea, milk, and chewy tapioca pearls, with endless variations to explore."
    ],
    [
      "Pineapple cake",
      "A buttery pastry with a sweet filling, perfect for a tea break or a gift."
    ]
  ],
  "experiences": [
    [
      "Eat your way through a night market",
      "Try small portions, share with a friend, and follow whatever smells good."
    ],
    [
      "Take the scenic tea break",
      "Trade a hurried coffee for a slower encounter with Taiwanese tea."
    ],
    [
      "Wander an old street",
      "Explore Jiufen’s hillside lanes or the historic streets of Tainan."
    ]
  ],
  "itinerary": [
    [
      "Days 1–3 / Taipei & Jiufen",
      "City landmarks, night-market dinners, and a hillside day trip."
    ],
    [
      "Days 4–5 / Sun Moon Lake",
      "Add a lakeside stay with time for walks, views, and cycling."
    ],
    [
      "Days 6–7 / Tainan",
      "End with temple visits and local food. Add Kaohsiung if you have more time."
    ]
  ],
  "source": "https://eng.taiwan.net.tw/",
  "sourceName": "Taiwan Tourism"
};

export default function TaiwanPage() {
  return <Destination data={destination} />;
}
