import { Jet, Yacht, SfItem } from "./types";

export const jets: Jet[] = [
  { name: "Gulfstream G650ER", price: "$66.5M", cat: "Heavy Jet", loc: "Dubai South, UAE", image: "/images/g650er.jpeg" },
  { name: "Global 7500", price: "$75M", cat: "Long Range Jet", loc: "Geneva, Switzerland", image: "/images/global7500.jpeg" },
  { name: "Falcon 8X", price: "$58M", cat: "Long Range Jet", loc: "Le Bourget, France", image: "/images/falcon8x.jpeg" },
  { name: "Praetor 600", price: "$21M", cat: "Super-Midsize Jet", loc: "Miami, USA", image: "/images/praetor600.jpg" },
  { name: "Citation Latitude", price: "$18.9M", cat: "Mid-Size Jet", loc: "Teterboro, USA", image: "/images/citationlatitude.jpg" },
  { name: "Challenger 350", price: "$27M", cat: "Super-Midsize Jet", loc: "London, UK", image: "/images/challenger350.jpg" },
  { name: "Phenom 300E", price: "$10.9M", cat: "Light Jet", loc: "Zurich, Switzerland", image: "/images/phenom300e.jpeg" },
  { name: "Legacy 500", price: "$20.5M", cat: "Mid-Size Jet", loc: "São Paulo, Brazil", image: "/images/legacy500.jpg" },
  { name: "Embraer Lineage 1000E", price: "$53M", cat: "VIP Airliner", loc: "Doha, Qatar", image: "/images/lineage1000e.jpg" },
  { name: "Gulfstream G700", price: "$78M", cat: "Flagship Heavy Jet", loc: "Dubai South, UAE", image: "/images/g700.jpeg" },
];

export const yachts: Yacht[] = [
  { name: "Azimut Grande 35M", price: "$28M", cat: "Motor Yacht", loc: "Monaco" },
  { name: "Feadship Superyacht", price: "$62M", cat: "Superyacht", loc: "Athens, Greece" },
  { name: "Riva 110 Dolceriva", price: "$19.5M", cat: "Sport Yacht", loc: "Porto Cervo, Italy" },
  { name: "Sunseeker Manhattan 63", price: "$3.2M", cat: "Motor Yacht", loc: "Fort Lauderdale, USA" },
  { name: "Benetti Lilium", price: "$45M", cat: "Superyacht", loc: "Bodrum, Turkey" },
  { name: "Custom Line 106", price: "$16.8M", cat: "Flybridge Yacht", loc: "Seychelles" },
  { name: "Custom Explorer 50M", price: "$52M", cat: "Explorer Yacht", loc: "Capri, Italy" },
];

export const sfFeatured: SfItem[] = [
  { name: "Cessna Citation CJ3+", cat: "Light Jet", year: 2022, image: "/images/sf-jet-01.jpg" },
  { name: "Embraer Phenom 300E", cat: "Light Jet", year: 2023, image: "/images/sf-jet-02.jpg" },
  { name: "HondaJet Elite II", cat: "Light Jet", year: 2023, image: "/images/sf-jet-03.jpg" },
  { name: "Cessna Citation Latitude", cat: "Mid-Size Jet", year: 2021, image: "/images/sf-jet-04.jpg" },
  { name: "Bombardier Learjet 75 Liberty", cat: "Mid-Size Jet", year: 2020, image: "/images/sf-jet-05.jpg" },
  { name: "Pilatus PC-24", cat: "Mid-Size Jet", year: 2023, image: "/images/sf-jet-06.jpg" },
  { name: "Bombardier Challenger 605", cat: "Heavy Jet", year: 2019, image: "/images/sf-jet-07.jpg" },
];

export const sfAlternative: SfItem[] = [
  { name: "Dassault Falcon 2000S", cat: "Heavy Jet", year: 2020, image: "/images/sf-jet-08.jpg" },
  { name: "Gulfstream G280", cat: "Heavy Jet", year: 2021, image: "/images/sf-jet-09.jpg" },
  { name: "Gulfstream G650ER", cat: "Long Range Jet", year: 2019, image: "/images/sf-jet-10.jpg" },
  { name: "Bombardier Global 7500", cat: "Long Range Jet", year: 2021, image: "/images/sf-jet-01.jpg" },
  { name: "Dassault Falcon 8X", cat: "Long Range Jet", year: 2022, image: "/images/sf-jet-02.jpg" },
  { name: "Boeing Business Jet 2", cat: "VIP Airliner", year: 2018, image: "/images/sf-jet-03.jpg" },
  { name: "Airbus ACJ319neo", cat: "VIP Airliner", year: 2023, image: "/images/sf-jet-04.jpg" },
];

export const sfAdditional: SfItem[] = [
  { name: "Pilatus PC-12 NGX", cat: "Turboprop", year: 2023, image: "/images/sf-jet-05.jpg" },
  { name: "Beechcraft King Air 360", cat: "Turboprop", year: 2022, image: "/images/sf-jet-06.jpg" },
  { name: "AgustaWestland AW139", cat: "Helicopter", year: 2021, image: "/images/sf-jet-07.jpg" },
  { name: "Sikorsky S-92 VIP", cat: "Helicopter", year: 2020, image: "/images/sf-jet-08.jpg" },
  { name: "Embraer Praetor 600", cat: "Mid-Size Jet", year: 2022, image: "/images/sf-jet-09.jpg" },
  { name: "Cessna Citation Longitude", cat: "Mid-Size Jet", year: 2020, image: "/images/sf-jet-10.jpg" },
  { name: "Cessna Citation CJ3 Freight", cat: "Light Jet", year: 2019, image: "/images/sf-jet-01.jpg" },
];

export const cityOptions = [
  "New York (JFK)", "London (LHR)", "Dubai (DXB)", "Singapore (SIN)", "Paris (CDG)",
  "Los Angeles (LAX)", "Tokyo (HND)", "Sydney (SYD)", "Moscow (SVO)", "Hong Kong (HKG)",
  "Geneva (GVA)", "Miami (MIA)", "Cape Town (CPT)", "São Paulo (GRU)", "Mumbai (BOM)",
  "Toronto (YYZ)", "Doha (DOH)", "Istanbul (IST)", "Amsterdam (AMS)", "Zurich (ZRH)",
];

const catBase: Record<string, { p: [number, number]; cab: [number, number]; rng: [number, number]; price: [number, number]; eng: string; cr: [number, number]; alt: number; hrs: [number, number] }> = {
  "Light Jet": { p: [6, 8], cab: [17, 19], rng: [1900, 2300], price: [8, 13], eng: "Williams International FJ44", cr: [410, 430], alt: 450, hrs: [150, 900] },
  "Mid-Size Jet": { p: [8, 10], cab: [20, 24], rng: [3000, 3600], price: [17, 23], eng: "Honeywell HTF7350", cr: [450, 470], alt: 450, hrs: [300, 1200] },
  "Heavy Jet": { p: [12, 16], cab: [30, 34], rng: [5200, 6100], price: [27, 36], eng: "Rolls-Royce BR725", cr: [480, 500], alt: 510, hrs: [200, 900] },
  "Long Range Jet": { p: [13, 19], cab: [38, 43], rng: [6500, 7700], price: [57, 79], eng: "Rolls-Royce Pearl 700", cr: [500, 516], alt: 510, hrs: [150, 700] },
  "VIP Airliner": { p: [19, 26], cab: [60, 92], rng: [5900, 6600], price: [52, 90], eng: "CFM International CFM56", cr: [470, 490], alt: 410, hrs: [400, 1500] },
  Turboprop: { p: [8, 11], cab: [15, 17], rng: [1650, 1950], price: [5, 9], eng: "Pratt & Whitney PT6A", cr: [270, 320], alt: 300, hrs: [50, 500] },
  Helicopter: { p: [9, 13], cab: [13, 17], rng: [400, 650], price: [14, 23], eng: "GE / Pratt & Whitney Turboshaft", cr: [145, 175], alt: 180, hrs: [1500, 2300] },
};

const knownSpecs: Record<string, Partial<Record<string, number | string>>> = {
  "Pilatus PC-12 NGX": { price: "$5.8M", passengers: 9, cabin: 16.8, range: 1804, engine: "Pratt & Whitney PT6E-67XP", cruise: 290, maxAlt: 300, hours: 90, health: 100 },
  "Beechcraft King Air 360": { price: "$8.2M", passengers: 11, cabin: 16.7, range: 1806, engine: "Pratt & Whitney PT6A-65SC", cruise: 312, maxAlt: 350, hours: 430, health: 97 },
  "AgustaWestland AW139": { price: "$16.5M", passengers: 12, cabin: 14.4, range: 573, engine: "Pratt & Whitney PT6C-67C", cruise: 165, maxAlt: 200, hours: 1800, health: 94 },
  "Sikorsky S-92 VIP": { price: "$22M", passengers: 9, cabin: 16.8, range: 580, engine: "General Electric CT7-8A", cruise: 151, maxAlt: 150, hours: 2200, health: 92 },
};

export function sfSpecsFor(item: SfItem) {
  const known = knownSpecs[item.name];
  if (known) {
    return {
      name: item.name,
      year: item.year,
      price: known.price as string,
      passengers: known.passengers as number,
      cabin: known.cabin as number,
      range: known.range as number,
      engine: known.engine as string,
      cruise: known.cruise as number,
      maxAlt: known.maxAlt as number,
      hours: known.hours as number,
      health: known.health as number,
    };
  }
  const c = catBase[item.cat] || catBase["Mid-Size Jet"];
  const seed = item.name.length;
  const pick = (range: [number, number], mod: number) => range[0] + (seed * mod) % (range[1] - range[0] + 1);
  const priceM = (pick([c.price[0] * 10, c.price[1] * 10], 7) / 10).toFixed(1);
  return {
    name: item.name,
    year: item.year,
    price: `$${priceM}M`,
    passengers: pick(c.p, 3),
    cabin: pick(c.cab, 5),
    range: pick(c.rng, 37),
    engine: c.eng,
    cruise: pick(c.cr, 11),
    maxAlt: c.alt,
    hours: pick(c.hrs, 53),
    health: 100 - ((seed * 2) % 15),
  };
}

/* ---------------------------------------------------------------
   Category accent colors (used by the asset detail window)
--------------------------------------------------------------- */
export interface CategoryAccent {
  accent: string;
  accent2: string;
  soft: string;
}

const categoryAccents: { match: string; accent: CategoryAccent }[] = [
  { match: "light", accent: { accent: "#3dd598", accent2: "#1f8f66", soft: "rgba(61,213,152,.14)" } },
  { match: "mid", accent: { accent: "#5b8def", accent2: "#3a63c4", soft: "rgba(91,141,239,.14)" } },
  { match: "heavy", accent: { accent: "#a479e6", accent2: "#7952b3", soft: "rgba(164,121,230,.14)" } },
  { match: "long range", accent: { accent: "#f2c46d", accent2: "#cda45e", soft: "rgba(242,196,109,.14)" } },
  { match: "vip", accent: { accent: "#e08bb0", accent2: "#b5567f", soft: "rgba(224,139,176,.14)" } },
  { match: "airliner", accent: { accent: "#e08bb0", accent2: "#b5567f", soft: "rgba(224,139,176,.14)" } },
  { match: "turboprop", accent: { accent: "#e0a458", accent2: "#b87c34", soft: "rgba(224,164,88,.14)" } },
  { match: "helicopter", accent: { accent: "#57c7d9", accent2: "#2f97a8", soft: "rgba(87,199,217,.14)" } },
  { match: "yacht", accent: { accent: "#4a90c4", accent2: "#2f6694", soft: "rgba(74,144,196,.14)" } },
];

export function getCategoryAccent(cat: string): CategoryAccent {
  const lower = cat.toLowerCase();
  const found = categoryAccents.find((entry) => lower.includes(entry.match));
  return found ? found.accent : { accent: "#cda45e", accent2: "#a9843f", soft: "rgba(205,164,94,.14)" };
}

/* ---------------------------------------------------------------
   Generic asset overview — model-level facts only, never
   seller-specific data (no ask price, hours, health, etc.)
--------------------------------------------------------------- */
export interface AssetOverview {
  name: string;
  engine: string;
  range: number;
  cabinOptions: string[];
  launchYear: number;
  lastProduction: string;
  avgMarketPrice: string;
  brandNewPriceRange: string;
  usedPriceRange: string;
  variance: string;
  passengers: number;
}

const cabinOptionSets: Record<string, string[]> = {
  "Light Jet": ["6-seat Executive", "7-seat Club", "8-seat High-Density"],
  "Mid-Size Jet": ["8-seat Executive", "9-seat Club", "10-seat Corporate"],
  "Heavy Jet": ["12-seat Executive", "14-seat Conference", "16-seat High-Density"],
  "Long Range Jet": ["13-seat Executive", "16-seat Conference", "19-seat High-Density"],
  "VIP Airliner": ["19-seat VIP", "26-seat Corporate Shuttle", "Full VVIP Configuration"],
  Turboprop: ["6-seat Standard", "9-seat Commuter", "11-seat High-Density"],
  Helicopter: ["6-seat VIP", "9-seat Corporate", "13-seat Utility"],
};

export function getAssetOverview(name: string, cat: string): AssetOverview {
  const known = knownSpecs[name];
  const c = catBase[cat] || catBase["Mid-Size Jet"];
  const seed = name.length + name.charCodeAt(0);

  const engine = (known?.engine as string) || c.eng;
  const range = (known?.range as number) || c.rng[0] + (seed * 37) % (c.rng[1] - c.rng[0] + 1);
  const passengers = (known?.passengers as number) || c.p[0] + (seed * 3) % (c.p[1] - c.p[0] + 1);

  const cabinPool = cabinOptionSets[cat] || cabinOptionSets["Mid-Size Jet"];
  const cabinOptions = [cabinPool[seed % cabinPool.length], cabinPool[(seed + 1) % cabinPool.length]].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  const launchYear = 2013 + (seed % 11);
  const stillInProduction = seed % 3 !== 0;
  const lastProduction = stillInProduction ? "In production" : `${launchYear + 4 + (seed % 5)}`;

  const priceM = known?.price
    ? parseFloat(String(known.price).replace(/[^0-9.]/g, ""))
    : c.price[0] + ((seed * 7) % ((c.price[1] - c.price[0]) * 10)) / 10;
  const avgMarketPrice = `$${priceM.toFixed(1)}M`;
  const variance = `±${4 + (seed % 9)}%`;

  // Brand new price range: only meaningful if the model is still in production.
  // Anchored above the average market price of used units on the platform.
  const newLowM = priceM * 1.12;
  const newHighM = priceM * 1.28;
  const brandNewPriceRange = stillInProduction
    ? `$${newLowM.toFixed(1)}M – $${newHighM.toFixed(1)}M`
    : "No longer in production";

  // Used price range: spread around the average market price, based on
  // age/condition variance seen across listed units.
  const usedLowM = priceM * 0.78;
  const usedHighM = priceM * 0.97;
  const usedPriceRange = `$${usedLowM.toFixed(1)}M – $${usedHighM.toFixed(1)}M`;

  return {
    name,
    engine,
    range,
    cabinOptions,
    launchYear,
    lastProduction,
    avgMarketPrice,
    brandNewPriceRange,
    usedPriceRange,
    variance,
    passengers,
  };
}
