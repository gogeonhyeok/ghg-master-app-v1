"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./coffee.module.css";

type CoffeeEntry = {
  name: string;
  category: string;
  origin: string;
  fact: string;
  ingredients: string;
};

type MachineEntry = {
  brand?: string;
  name: string;
  category: string;
  fact: string;
  bestFor: string;
};

type ApiCoffee = {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  image: string;
  source: "Hot" | "Iced";
};

const coffees: CoffeeEntry[] = [
  { name: "Espresso", category: "Espresso", origin: "Italy", fact: "A concentrated coffee brewed by forcing hot water through finely ground coffee. Crema is the golden foam created by the extraction itself.", ingredients: "Coffee" },
  { name: "Ristretto", category: "Espresso", origin: "Italy", fact: "A shorter espresso extraction. It uses less water and often tastes syrupier and sweeter than a full espresso.", ingredients: "Coffee" },
  { name: "Lungo", category: "Espresso", origin: "Italy", fact: "The name means ‘long’ in Italian: more water passes through the coffee than in an espresso, creating a longer but potentially more bitter cup.", ingredients: "Coffee · Water" },
  { name: "Americano", category: "Brewed", origin: "Italy / United States", fact: "Espresso diluted with hot water. Adding water after extraction keeps it distinct from brewing a filter coffee from the start.", ingredients: "Espresso · Hot water" },
  { name: "Long Black", category: "Brewed", origin: "Australia / New Zealand", fact: "Hot water is poured first, then espresso is added. This usually preserves more crema than an Americano.", ingredients: "Hot water · Espresso" },
  { name: "Filter Coffee", category: "Brewed", origin: "Global", fact: "Water flows through ground coffee and a filter. Paper filters remove much of the coffee oil and sediment, producing a clean cup.", ingredients: "Coffee · Water" },
  { name: "French Press", category: "Brewed", origin: "France", fact: "An immersion brew pressed through a metal mesh. It leaves more oils and fine particles in the cup than paper-filter brewing.", ingredients: "Coffee · Water" },
  { name: "Cold Brew", category: "Iced", origin: "Global", fact: "Coffee grounds steep in cool water for many hours. Its smooth taste comes from a slower extraction, not from simply serving hot coffee over ice.", ingredients: "Coffee · Cold water" },
  { name: "Latte", category: "Milk", origin: "Italy / United States", fact: "Espresso combined with a larger amount of steamed milk and a thin foam layer. Latte art depends on smooth microfoam, not stiff bubbles.", ingredients: "Espresso · Steamed milk" },
  { name: "Cappuccino", category: "Milk", origin: "Italy", fact: "Traditionally built around espresso, steamed milk, and a substantial foam layer in a relatively small drink.", ingredients: "Espresso · Milk · Foam" },
  { name: "Flat White", category: "Milk", origin: "Australia / New Zealand", fact: "Espresso with fine microfoam and a stronger coffee presence than many lattes. Its exact origin is disputed between Australia and New Zealand.", ingredients: "Espresso · Microfoam" },
  { name: "Mocha", category: "Milk", origin: "Global", fact: "A latte-style drink with chocolate. The name recalls Al Mokha, a Yemeni port historically associated with coffee trading.", ingredients: "Espresso · Milk · Chocolate" },
  { name: "Kopi", category: "Singapore", origin: "Singapore", fact: "Singapore kopitiam coffee is traditionally brewed through a cloth ‘sock’ filter and commonly served with sweetened condensed milk.", ingredients: "Kopi · Condensed milk" },
  { name: "Kopi O", category: "Singapore", origin: "Singapore", fact: "‘O’ means black coffee in kopitiam ordering language: coffee with sugar, but without milk. ‘Kopi O kosong’ leaves out the sugar too.", ingredients: "Kopi · Sugar" },
  { name: "Kopi C", category: "Singapore", origin: "Singapore", fact: "‘C’ generally signals evaporated milk and sugar. It is lighter and less caramel-sweet than kopi made with condensed milk.", ingredients: "Kopi · Evaporated milk · Sugar" },
  { name: "Kopi Gao", category: "Singapore", origin: "Singapore", fact: "‘Gao’ means thick or strong. It asks for a more intense kopi profile, while ‘siew dai’ asks for less sugar.", ingredients: "Strong kopi · Milk" },
  { name: "Yuan Yang", category: "Singapore", origin: "Hong Kong / Singapore", fact: "A coffee-and-tea drink. In Singapore it is often called kopi cham, with ‘cham’ referring to the blend of coffee and tea.", ingredients: "Coffee · Tea · Milk" },
];

const machines: MachineEntry[] = [
  { brand: "De'Longhi", name: "Dedica Style", category: "Semi-automatic", fact: "A compact pump espresso machine designed for small kitchens. It uses a portafilter and a manual steam wand, so you can practice dialing in a shot and texturing milk.", bestFor: "A first home espresso setup" },
  { brand: "De'Longhi", name: "Magnifica Start", category: "Bean-to-cup", fact: "An automatic machine that grinds beans immediately before brewing and prepares coffee at the press of a button. Its removable brew group makes regular cleaning important.", bestFor: "Easy coffee for visitors" },
  { brand: "Nespresso", name: "Essenza Mini", category: "Capsule", fact: "A small Original-system capsule machine with a fast, simple workflow. It is convenient for serving several drinks quickly, with less control over the extraction than a portafilter machine.", bestFor: "Small spaces and quick cups" },
  { brand: "Nespresso", name: "Vertuo Pop", category: "Capsule", fact: "A Vertuo-system machine that reads the capsule barcode and adjusts the brewing parameters. It supports larger cup sizes than the Original system.", bestFor: "Long coffees and variety" },
  { brand: "Breville", name: "Bambino", category: "Semi-automatic", fact: "A compact espresso machine with automatic milk texturing on some versions. It is aimed at people who want café-style drinks without a large machine footprint.", bestFor: "Learning espresso and latte art" },
  { brand: "Philips", name: "3200 LatteGo", category: "Bean-to-cup", fact: "A one-touch bean-to-cup machine with an external milk system. Simple milk-system cleaning is useful when the machine will serve a whole household or group.", bestFor: "Low-effort milk drinks" },
  { name: "Moka Pot", category: "Stovetop", fact: "Steam pressure pushes water through coffee, producing a strong, concentrated brew. It does not make true espresso because its pressure is much lower.", bestFor: "Strong coffee without electricity" },
  { name: "Espresso Machine", category: "Pressure", fact: "A pump or lever forces hot water through a compact coffee puck. Grind size, dose, temperature, and time all shape the shot.", bestFor: "Espresso, americanos, milk drinks" },
  { name: "Manual Lever", category: "Pressure", fact: "The barista controls extraction pressure with a lever. It offers tactile control but demands consistent preparation and technique.", bestFor: "Hands-on espresso brewing" },
  { name: "AeroPress", category: "Immersion", fact: "A lightweight brewer combines steeping and gentle pressure. Its paper microfilter makes a clean cup, and recipes can range from short to long.", bestFor: "Travel and experimentation" },
  { name: "French Press", category: "Immersion", fact: "Coffee steeps freely in water before a plunger separates the grounds. A coarse grind helps reduce grit and over-extraction.", bestFor: "Full-bodied shared pots" },
  { name: "Pour-over Dripper", category: "Filter", fact: "The brewer controls the flow of water over the grounds. A steady pour and even bed help make extraction more uniform.", bestFor: "Clear, nuanced cups" },
  { name: "Batch Brewer", category: "Filter", fact: "An automatic machine repeats a measured filter-brewing recipe for several cups. Good models control water temperature and shower coverage carefully.", bestFor: "Consistent everyday coffee" },
  { name: "Siphon", category: "Vacuum", fact: "Vapor pressure moves water between glass chambers, followed by a vacuum that draws the brewed coffee back down through a filter.", bestFor: "Theatrical, precise brewing" },
  { name: "Cold Brew Tower", category: "Cold", fact: "Cold water drips slowly through coffee over several hours. The resulting concentrate is usually diluted before serving.", bestFor: "Smooth iced coffee" },
  { brand: "General", name: "Bean-to-Cup", category: "Automatic", fact: "An integrated grinder doses beans and an automated system brews them. Convenience is high, but cleaning the grinder and milk path is essential.", bestFor: "One-touch drinks" },
  { brand: "General", name: "Capsule Machine", category: "Automatic", fact: "Pre-portioned coffee capsules make brewing fast and repeatable. The trade-offs are packaging waste, limited freshness control, and less recipe flexibility.", bestFor: "Speed and low mess" },
  { name: "Singapore Kopitiam Sock", category: "Traditional", fact: "A cloth filter bag is used to brew strong kopi, often by repeatedly pouring hot water through the grounds. The sock is rinsed and maintained between uses.", bestFor: "Traditional kopi" },
];

const coffeeCategories = ["All", ...new Set(coffees.map((coffee) => coffee.category))];
const machineCategories = ["All", ...new Set(machines.map((machine) => machine.category))];

export default function CoffeePage() {
  const [coffeeFilter, setCoffeeFilter] = useState("All");
  const [machineFilter, setMachineFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [apiCoffees, setApiCoffees] = useState<ApiCoffee[]>([]);
  const [apiStatus, setApiStatus] = useState<"loading" | "ready" | "error">("loading");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCoffees = useMemo(() => coffees.filter((coffee) => matches(coffee, coffeeFilter, normalizedQuery)), [coffeeFilter, normalizedQuery]);
  const filteredMachines = useMemo(() => machines.filter((machine) => matches(machine, machineFilter, normalizedQuery)), [machineFilter, normalizedQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApiCoffees() {
      try {
        const responses = await Promise.all([
          fetch("https://api.sampleapis.com/coffee/hot", { signal: controller.signal }),
          fetch("https://api.sampleapis.com/coffee/iced", { signal: controller.signal }),
        ]);

        if (responses.some((response) => !response.ok)) throw new Error("Coffee API request failed");

        const [hot, iced] = await Promise.all(responses.map((response) => response.json()));
        const entries = [
          ...hot.slice(0, 4).map((coffee: Omit<ApiCoffee, "source">) => ({ ...coffee, source: "Hot" as const })),
          ...iced.slice(0, 4).map((coffee: Omit<ApiCoffee, "source">) => ({ ...coffee, source: "Iced" as const })),
        ];
        setApiCoffees(entries);
        setApiStatus("ready");
      } catch {
        if (!controller.signal.aborted) setApiStatus("error");
      }
    }

    void loadApiCoffees();
    return () => controller.abort();
  }, []);

  const featuredCoffee = apiCoffees[featuredIndex % apiCoffees.length];

  return (
    <main className={styles.page}>
      <div className={styles.controls}>
        <div className={styles.pageTitle}>
          <p className={styles.eyebrow}>Coffee menu builder</p>
          <h1>Choose a cup.</h1>
        </div>
        <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coffee, origin, or fact" /></label>
        <span className={styles.count}>{filteredCoffees.length + filteredMachines.length} entries</span>
      </div>

      <ApiCoffeeSection
        coffees={apiCoffees}
        featuredCoffee={featuredCoffee}
        status={apiStatus}
        onShuffle={() => setFeaturedIndex((index) => index + 1)}
      />

      <section className={styles.section} aria-labelledby="coffee-title">
        <SectionHeading number="01" title="Coffee drinks" description="Recipes, traditions, and useful ordering language." />
        <FilterBar categories={coffeeCategories} active={coffeeFilter} onChange={setCoffeeFilter} />
        <div className={styles.grid}>
          {filteredCoffees.map((coffee) => <CoffeeCard key={coffee.name} coffee={coffee} />)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.machineSection}`} aria-labelledby="machine-title">
        <SectionHeading number="02" title="Coffee machines" description="The mechanisms behind pressure, immersion, filtration, and convenience." />
        <FilterBar categories={machineCategories} active={machineFilter} onChange={setMachineFilter} />
        <div className={styles.grid}>
          {filteredMachines.map((machine) => <MachineCard key={machine.name} machine={machine} />)}
        </div>
      </section>

      <footer className={styles.footer}>
        <div><p className={styles.eyebrow}>For the neighborhood</p><h2>Free coffee from home.</h2><p>Help shape the first menu with a drink or machine idea. The goal is a welcoming cup, no charge, and a little time to meet people nearby.</p></div>
        <a href="mailto:gogeonhyeok@outlook.com?subject=Coffee%20menu%20idea">Share a coffee idea <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}

function ApiCoffeeSection({
  coffees: apiCoffees,
  featuredCoffee,
  status,
  onShuffle,
}: {
  coffees: ApiCoffee[];
  featuredCoffee?: ApiCoffee;
  status: "loading" | "ready" | "error";
  onShuffle: () => void;
}) {
  return (
    <section className={styles.apiSection} aria-labelledby="api-coffee-title">
      <div className={styles.apiHeading}>
        <div>
          <p className={styles.eyebrow}>Live from the coffee API</p>
          <h2 id="api-coffee-title">A fresh pour.</h2>
          <p>New drink ideas with ingredients and images, pulled from a free public source.</p>
        </div>
        <button className={styles.shuffleButton} type="button" onClick={onShuffle} disabled={!apiCoffees.length}>
          Shuffle pick <span aria-hidden="true">↻</span>
        </button>
      </div>

      {status === "loading" && <p className={styles.apiMessage}>Finding a few drinks...</p>}
      {status === "error" && <p className={styles.apiMessage}>The live menu is taking a break. The glossary is still available below.</p>}
      {featuredCoffee && (
        <div className={styles.apiFeature}>
          <div className={styles.apiImage} role="img" aria-label={`${featuredCoffee.title} coffee`} style={{ backgroundImage: `url("${featuredCoffee.image}")` }} />
          <div className={styles.apiFeatureCopy}>
            <div className={styles.cardTop}><span className={styles.category}>{featuredCoffee.source} pick</span><span className={styles.origin}>#{featuredCoffee.id}</span></div>
            <h3>{featuredCoffee.title}</h3>
            <p>{featuredCoffee.description}</p>
            <footer>{featuredCoffee.ingredients.join(" · ")}</footer>
          </div>
        </div>
      )}

      {apiCoffees.length > 1 && <div className={styles.apiGrid}>{apiCoffees.filter((coffee) => coffee.id !== featuredCoffee?.id || coffee.source !== featuredCoffee.source).map((coffee) => <ApiCoffeeCard key={`${coffee.source}-${coffee.id}`} coffee={coffee} />)}</div>}
    </section>
  );
}

function ApiCoffeeCard({ coffee }: { coffee: ApiCoffee }) {
  return <article className={styles.apiCard}><div className={styles.apiThumbnail} role="img" aria-label={`${coffee.title} coffee`} style={{ backgroundImage: `url("${coffee.image}")` }} /><div><div className={styles.cardTop}><span className={styles.category}>{coffee.source}</span><span className={styles.origin}>API pick</span></div><h3>{coffee.title}</h3><footer>{coffee.ingredients.slice(0, 3).join(" · ")}</footer></div></article>;
}

function matches(entry: CoffeeEntry | MachineEntry, category: string, query: string) {
  const searchable = Object.values(entry).join(" ").toLowerCase();
  return (category === "All" || entry.category === category) && (!query || searchable.includes(query));
}

function SectionHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className={styles.sectionHeading}><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function FilterBar({ categories, active, onChange }: { categories: string[]; active: string; onChange: (category: string) => void }) {
  return <div className={styles.filters} aria-label="Filter entries">{categories.map((category) => <button type="button" className={active === category ? styles.activeFilter : ""} key={category} onClick={() => onChange(category)}>{category}</button>)}</div>;
}

function CoffeeCard({ coffee }: { coffee: CoffeeEntry }) {
  return <article className={styles.card}><div className={styles.cardTop}><span className={styles.category}>{coffee.category}</span><span className={styles.origin}>{coffee.origin}</span></div><h3>{coffee.name}</h3><p>{coffee.fact}</p><footer>{coffee.ingredients}</footer></article>;
}

function MachineCard({ machine }: { machine: MachineEntry }) {
  return <article className={`${styles.card} ${styles.machineCard}`}><div className={styles.cardTop}><span className={styles.category}>{machine.brand ?? "Brewing method"}</span><span className={styles.origin}>{machine.category}</span></div><h3>{machine.name}</h3><p>{machine.fact}</p><footer><strong>Best for</strong>{machine.bestFor}</footer></article>;
}