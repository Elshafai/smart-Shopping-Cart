// Landmark positions as percentages of image dimensions for resolution independence
export interface Landmark {
  name: string;
  xPct: number; // percentage of image width (0-1)
  yPct: number; // percentage of image height (0-1)
}

// These coordinates are approximate based on the mall map layout
// Adjust after visual inspection
export const LANDMARKS: Landmark[] = [
  { name: "Chanel", xPct: 0.15, yPct: 0.25 },
  { name: "Rolex", xPct: 0.35, yPct: 0.20 },
  { name: "Pandora", xPct: 0.55, yPct: 0.25 },
  { name: "Mall Office", xPct: 0.80, yPct: 0.15 },
  { name: "Levi's", xPct: 0.20, yPct: 0.70 },
  { name: "Vans", xPct: 0.40, yPct: 0.75 },
  { name: "ATM", xPct: 0.65, yPct: 0.70 },
  { name: "Starbucks", xPct: 0.85, yPct: 0.75 },
];
