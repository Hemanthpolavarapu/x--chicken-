import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  PHASE3_COLLECTIONS,
  ProductDocument,
} from "@/database/phase3Collections";

export const CANONICAL_PRODUCTS: Omit<ProductDocument, "_id" | "createdAt" | "updatedAt">[] = [
  {
    productId: "xc-curry-cut-small",
    name: "Chicken Curry Cut – Small Pieces",
    category: "curry-cut",
    image: "/images/products/prod-2.jpg",
    basePrice: 159,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 159, originalPrice: 189 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 299, originalPrice: 359 },
    ],
  },
  {
    productId: "xc-curry-cut-large",
    name: "Chicken Curry Cut – Large Pieces",
    category: "curry-cut",
    image: "/images/products/prod-4.png",
    basePrice: 165,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 165, originalPrice: 195 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 309, originalPrice: 369 },
    ],
  },
  {
    productId: "xc-boneless-small",
    name: "Chicken Boneless – Small Cubes",
    category: "boneless-mince",
    image: "/images/products/prod-1.jpg",
    basePrice: 229,
    netWeight: "450g",
    isActive: true,
    variants: [
      { id: "450g", label: "450g", netWeight: "450g", price: 229, originalPrice: 269 },
      { id: "900g", label: "900g", netWeight: "900g", price: 439, originalPrice: 519 },
    ],
  },
  {
    productId: "xc-boneless-large",
    name: "Chicken Breast Fillet – Boneless",
    category: "boneless-mince",
    image: "/images/products/prod-1.jpg",
    basePrice: 239,
    netWeight: "450g",
    isActive: true,
    variants: [
      { id: "450g", label: "450g", netWeight: "450g", price: 239, originalPrice: 280 },
      { id: "900g", label: "900g", netWeight: "900g", price: 459, originalPrice: 540 },
    ],
  },
  {
    productId: "xc-chicken-mince-keema",
    name: "Fresh Chicken Keema (Mince)",
    category: "boneless-mince",
    image: "/images/products/prod-3.png",
    basePrice: 199,
    netWeight: "450g",
    isActive: true,
    variants: [
      { id: "450g", label: "450g", netWeight: "450g", price: 199, originalPrice: 230 },
      { id: "900g", label: "900g", netWeight: "900g", price: 385, originalPrice: 445 },
    ],
  },
  {
    productId: "xc-chicken-drumstick",
    name: "Plump Chicken Drumsticks (Tangdi)",
    category: "speciality-cuts",
    image: "/images/products/prod-5.jpg",
    basePrice: 219,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 219, originalPrice: 249 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 419, originalPrice: 485 },
    ],
  },
  {
    productId: "xc-chicken-leg-thigh",
    name: "Chicken Whole Leg & Thigh Cut",
    category: "speciality-cuts",
    image: "/images/products/prod-5.jpg",
    basePrice: 225,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 225, originalPrice: 259 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 429, originalPrice: 495 },
    ],
  },
  {
    productId: "xc-chicken-lollipops",
    name: "Chicken Lollipops",
    category: "speciality-cuts",
    image: "/images/products/prod-5.jpg",
    basePrice: 209,
    netWeight: "400g",
    isActive: true,
    variants: [
      { id: "400g", label: "400g", netWeight: "400g", price: 209, originalPrice: 245 },
      { id: "800g", label: "800g", netWeight: "800g", price: 399, originalPrice: 475 },
    ],
  },
  {
    productId: "xc-chicken-bones-soup",
    name: "Chicken Soup Bones & Carcass",
    category: "speciality-cuts",
    image: "/images/products/prod-2.jpg",
    basePrice: 99,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 99, originalPrice: 120 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 185, originalPrice: 229 },
    ],
  },
  {
    productId: "xc-chicken-biryani-cut",
    name: "Chicken Biryani Special Cut",
    category: "speciality-cuts",
    image: "/images/products/prod-6.jpg",
    basePrice: 189,
    netWeight: "500g",
    isActive: true,
    variants: [
      { id: "500g", label: "500g", netWeight: "500g", price: 189, originalPrice: 220 },
      { id: "1kg", label: "1 kg", netWeight: "1 kg", price: 359, originalPrice: 419 },
    ],
  },
  {
    productId: "xc-chicken-liver",
    name: "Fresh Chicken Liver",
    category: "offals",
    image: "/images/products/prod-3.png",
    basePrice: 119,
    netWeight: "250g",
    isActive: true,
    variants: [
      { id: "250g", label: "250g", netWeight: "250g", price: 119, originalPrice: 145 },
      { id: "500g", label: "500g", netWeight: "500g", price: 219, originalPrice: 269 },
    ],
  },
  {
    productId: "xc-chicken-gizzard",
    name: "Cleaned Chicken Gizzard",
    category: "offals",
    image: "/images/products/prod-3.png",
    basePrice: 129,
    netWeight: "250g",
    isActive: true,
    variants: [
      { id: "250g", label: "250g", netWeight: "250g", price: 129, originalPrice: 155 },
      { id: "500g", label: "500g", netWeight: "500g", price: 239, originalPrice: 289 },
    ],
  },
  {
    productId: "xc-combo-curry-drumsticks",
    name: "Curry Cut + Drumsticks Combo",
    category: "combos",
    image: "/images/products/prod-7.jpg",
    basePrice: 249,
    netWeight: "750g Total",
    isActive: true,
    variants: [
      { id: "750g", label: "750g Total", netWeight: "750g Total", price: 249, originalPrice: 299 },
      { id: "1.25kg", label: "1.25 kg Total", netWeight: "1.25 kg Total", price: 389, originalPrice: 465 },
    ],
  },
  {
    productId: "xc-combo-curry-liver",
    name: "Curry Cut + Fresh Liver Combo",
    category: "combos",
    image: "/images/products/prod-7.jpg",
    basePrice: 259,
    netWeight: "750g Total",
    isActive: true,
    variants: [
      { id: "750g", label: "750g Total", netWeight: "750g Total", price: 259, originalPrice: 315 },
      { id: "1.25kg", label: "1.25 kg Total", netWeight: "1.25 kg Total", price: 399, originalPrice: 485 },
    ],
  },
];

let seededCatalog = false;

export async function ensureCanonicalProductsSeeded(): Promise<void> {
  const db = await getDatabase();
  await ensurePhase3Indexes(db);
  if (seededCatalog) return;
  const col = db.collection<ProductDocument>(PHASE3_COLLECTIONS.PRODUCTS);
  const now = new Date();
  await Promise.all(
    CANONICAL_PRODUCTS.map((p) =>
      col.updateOne(
        { productId: p.productId },
        {
          $setOnInsert: {
            productId: p.productId,
            createdAt: now,
          },
          $set: {
            name: p.name,
            category: p.category,
            image: p.image,
            basePrice: p.basePrice,
            netWeight: p.netWeight,
            variants: p.variants,
            isActive: p.isActive,
            updatedAt: now,
          },
        },
        { upsert: true }
      )
    )
  );
  seededCatalog = true;
}
