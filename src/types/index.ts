export type ChickenCategory =
  | "all"
  | "curry-cut"
  | "biryani"
  | "boneless"
  | "starters"
  | "desi-country"
  | "mince"
  | "whole-specialty";

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: ChickenCategory;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  netWeight: string;
  grossWeight: string;
  pieces: string;
  serves: string;
  rating: number;
  reviewsCount: number;
  badge?: "Bestseller" | "Express Cut" | "Zero Frozen" | "Store Special" | "Farm Direct";
  image: string;
  inStock: boolean;
  idealFor: string[];
  freshnessBatch: string;
  temperatureAtStore: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCutPreference?: string;
}

export interface CategoryItem {
  id: ChickenCategory;
  name: string;
  tagline: string;
  icon: string;
  itemCount: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  city: string;
  locality: string;
  rating: number;
  verified: boolean;
  cutPurchased: string;
  reviewDate: string;
  title: string;
  comment: string;
  savedFromFrozen: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: "freshness" | "delivery" | "hygiene" | "ordering";
}
