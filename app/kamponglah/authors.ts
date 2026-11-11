// Broad labels for the bundled starter neighbourhoods, not precise addresses.
const regions: Record<string, string> = {
  "Bukit Panjang": "west", "Jurong West": "west",
  Woodlands: "north", Yishun: "north",
  Tampines: "east", Bedok: "east",
  Punggol: "north-east", Sengkang: "north-east",
  "Toa Payoh": "central", Bishan: "central", "Marine Parade": "central",
};

export function resolveAuthor(userName: string | null | undefined, area: string | null): string {
  const name = userName?.trim();
  if (name) return name.slice(0, 100);
  const region = area && Object.prototype.hasOwnProperty.call(regions, area) ? regions[area] : undefined;
  return region === "central" ? "Someone from central Singapore" : region ? `Someone from the ${region}` : "Wanderer";
}
