export interface Jet {
  name: string;
  price: string;
  cat: string;
  loc: string;
  image?: string;
}

export interface Yacht {
  name: string;
  price: string;
  cat: string;
  loc: string;
}

export interface SfItem {
  name: string;
  cat: string;
  year: number;
  image?: string;
}

export interface CompareSpec {
  name: string;
  year: number;
  price: string;
  passengers: number;
  cabin: number;
  range: number;
  engine: string;
  cruise: number;
  maxAlt: number;
  hours: number;
  health: number;
}
