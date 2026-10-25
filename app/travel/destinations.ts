export type DestinationSlug = "korea" | "taiwan" | "singapore";

export type DestinationData = {
  slug: DestinationSlug; name: string; local: string; tagline: string; intro: string; mood: string;
  placesTitle: string; places: [string, string, string][];
  foods: [string, string][]; experiences: [string, string][];
  itinerary: [string, string][]; source: string; sourceName: string;
};

export const destinations: DestinationData[] = [
  {
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
  },
  {
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
  },
  {
    "slug": "singapore",
    "name": "Singapore",
    "local": "新加坡",
    "tagline": "A whole world. One city.",
    "intro": "Gardens meet skyline. Heritage streets meet bold new ideas. Explore Singapore through its neighbourhoods, green spaces, and wonderfully varied food culture.",
    "mood": "GARDENS / SHOPHOUSES / HAWKER TABLES",
    "placesTitle": "One city. Many neighbourhoods.",
    "places": [
      [
        "Marina Bay",
        "THE ICONIC SKYLINE",
        "Walk the waterfront and explore the Supertrees and gardens at Gardens by the Bay."
      ],
      [
        "Kampong Gelam",
        "HERITAGE & STREET CULTURE",
        "Take in Sultan Mosque, browse Haji Lane, and linger around the shophouse-lined streets."
      ],
      [
        "Chinatown",
        "HISTORY & HAWKER FOOD",
        "Explore temples and historic streets, then make time for a meal at a hawker centre."
      ],
      [
        "Little India",
        "COLOUR & EVERYDAY LIFE",
        "Browse shops along Serangoon Road, see the neighbourhood’s temples, and pause for a meal."
      ]
    ],
    "foods": [
      [
        "Hainanese chicken rice",
        "Tender chicken with fragrant rice, chilli sauce, and a bowl of broth."
      ],
      [
        "Laksa",
        "Noodles in a rich, spicy coconut broth: a Singapore favourite."
      ],
      [
        "Kaya toast & kopi",
        "Coconut jam toast and local coffee, often enjoyed with soft-boiled eggs."
      ],
      [
        "Chilli crab",
        "Crab in a sweet, savoury, and spicy sauce, often paired with mantou buns."
      ]
    ],
    "experiences": [
      [
        "Spend a day in the gardens",
        "Explore Gardens by the Bay or take a leafy walk through Singapore Botanic Gardens."
      ],
      [
        "Share a hawker-table feast",
        "Order a few different dishes and discover how many food traditions fit around one table."
      ],
      [
        "Find your island afternoon",
        "Head to Sentosa for beaches and attractions, or plan a slower outing to Pulau Ubin."
      ]
    ],
    "itinerary": [
      [
        "Day 1 / Marina Bay",
        "Waterfront walks, Gardens by the Bay, and a skyline evening."
      ],
      [
        "Day 2 / Heritage neighbourhoods",
        "Explore Chinatown, Little India, and Kampong Gelam at your own pace."
      ],
      [
        "Day 3 / Green spaces or the coast",
        "Choose the Botanic Gardens or Sentosa, then finish with a hawker meal."
      ]
    ],
    "source": "https://www.visitsingapore.com/",
    "sourceName": "Visit Singapore"
  }
];

export function getDestination(value?: string | string[]): DestinationData {
  const slug = Array.isArray(value) ? value[0] : value;
  return destinations.find((destination) => destination.slug === slug) ?? destinations[0];
}
