import type { Metadata } from "next";
import Destination, { type DestinationData } from "../../components/travel/Destination";

export const metadata: Metadata = {"title": "Singapore | Elsewhere Travel", "description": "Gardens meet skyline. Heritage streets meet bold new ideas. Explore Singapore through its neighbourhoods, green spaces, and wonderfully varied food culture."};

const destination: DestinationData = {
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
};

export default function SingaporePage() {
  return <Destination data={destination} />;
}
