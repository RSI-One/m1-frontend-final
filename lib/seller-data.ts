export const sellerFairNews = [
  {
    id: "n1",
    theme: "purple",
    heading: "Gulfstream order book firms into Q3",
    description:
      "Long-range cabin demand remains concentrated on G700 and G800 slots. Brokers report shorter decision cycles among qualified buyers this quarter.",
    image: "/images/g700.jpeg",
  },
  {
    id: "n2",
    theme: "pink",
    heading: "Falcon 8X residual values hold",
    description:
      "Pre-owned 8X inventory is thin across Europe. Inspection-ready airframes with complete engine programs are clearing within 60 days.",
    image: "/images/falcon8x.jpeg",
  },
  {
    id: "n3",
    theme: "beige",
    heading: "Global 7500 availability tightens",
    description:
      "Delivery positions for late-model 7500s remain scarce. Off-market conversations now account for a larger share of closed large-cabin trades.",
    image: "/images/global7500.jpeg",
  },
  {
    id: "n4",
    theme: "caramel",
    heading: "G650ER still the liquidity benchmark",
    description:
      "The G650ER continues to set the bid for ultra-long-range resales. Clean logbooks and recent 1C checks are commanding a measurable premium.",
    image: "/images/g650er.jpeg",
  },
];

export const sellerOffMarketMeta: { name: string; interval: string; discount: string }[] = [
  { name: "Gulfstream G650ER", interval: "48h remaining", discount: "12% off" },
  { name: "Dassault Falcon 8X", interval: "5 days remaining", discount: "8% off" },
  { name: "Bombardier Global 7500", interval: "72h remaining", discount: "10% off" },
  { name: "Embraer Praetor 600", interval: "24h remaining", discount: "15% off" },
  { name: "Bombardier Challenger 605", interval: "6 days remaining", discount: "7% off" },
];
