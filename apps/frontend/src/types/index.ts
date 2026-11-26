export type ChickenCategory =
  | "all"
  | "curry-cut"
  | "boneless-mince"
  | "speciality-cuts"
  | "offals"
  | "combos";

export interface ProductVariant {
  id: string;
  label: string;
  netWeight: string;
  grossWeight: string;
  pieces: string;
  serves: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: Exclude<ChickenCategory, "all">;
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
  variants: ProductVariant[];
  chickenType: "Broiler" | "Country";
  boneType: "Bone-in" | "Boneless" | "Partly Boneless";
  cutType: string;
  packSizeGroup: "Under 500g" | "500g – 1 kg" | "Above 1 kg";
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCutPreference?: string;
  selectedVariant?: ProductVariant;
}

export interface CategoryItem {
  id: ChickenCategory;
  name: string;
  tagline: string;
  icon: string;
  itemCount: number;
  image: string;
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
