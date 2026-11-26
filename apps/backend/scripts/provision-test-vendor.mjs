import dns from "node:dns";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Ignore if env vars are supplied directly
}

if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_TEST_VENDOR !== "true") {
  console.error(
    "REFUSED: provision-test-vendor is strictly disabled unless NODE_ENV !== 'production' and ENABLE_DEV_TEST_VENDOR='true'."
  );
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "x_chicken";
const email = (process.env.TEST_VENDOR_EMAIL || "").trim().toLowerCase();
const password = process.env.TEST_VENDOR_PASSWORD || "";
const lat = Number(process.env.TEST_VENDOR_LAT || "17.4435");
const lng = Number(process.env.TEST_VENDOR_LNG || "78.3772");
const serviceRadiusKm = Number(process.env.TEST_VENDOR_RADIUS_KM || "15");

if (!uri || !email || !password) {
  console.error(
    "Missing required env vars: MONGODB_URI, TEST_VENDOR_EMAIL, TEST_VENDOR_PASSWORD"
  );
  process.exit(1);
}

if (uri.startsWith("mongodb+srv://")) {
  const servers = dns.getServers();
  if (servers.length === 0 || servers.every((s) => s === "127.0.0.1" || s === "::1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const CANONICAL_PRODUCTS = [
  {
    productId: "xc-curry-cut-small",
    name: "Chicken Curry Cut – Small Pieces",
    category: "curry-cut",
    image: "/images/products/prod-2.jpg",
    basePrice: 159,
    netWeight: "500g",
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
    variants: [
      { id: "750g", label: "750g Total", netWeight: "750g Total", price: 259, originalPrice: 315 },
      { id: "1.25kg", label: "1.25 kg Total", netWeight: "1.25 kg Total", price: 399, originalPrice: 485 },
    ],
  },
];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(dbName);

try {
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 12);

  const usersCol = db.collection("users");
  const vendorsCol = db.collection("vendors");
  const storesCol = db.collection("stores");
  const productsCol = db.collection("products");
  const inventoryCol = db.collection("inventory");

  await Promise.all([
    usersCol.createIndex({ email: 1 }, { unique: true, name: "uniq_user_email" }),
    storesCol.createIndex({ location: "2dsphere" }),
    storesCol.createIndex({ vendorId: 1 }, { unique: true }),
    inventoryCol.createIndex({ storeId: 1, productId: 1, variantId: 1 }, { unique: true }),
  ]);

  const userRes = await usersCol.findOneAndUpdate(
    { email },
    {
      $setOnInsert: { _id: new ObjectId(), email, createdAt: now },
      $set: {
        name: "Vendor Test",
        phone: "9999999999",
        passwordHash,
        role: "VENDOR",
        status: "ACTIVE",
        failedLoginAttempts: 0,
        isDevTestAccount: true,
        updatedAt: now,
      },
      $unset: { lockedUntil: "" },
    },
    { upsert: true, returnDocument: "after" }
  );

  const userId = userRes._id;

  const vendorRes = await vendorsCol.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { _id: new ObjectId(), userId, createdAt: now },
      $set: {
        ownerName: "Vendor Test",
        email,
        phone: "9999999999",
        approvalStatus: "APPROVED",
        approvalReason: "Provisioned local dev test vendor",
        approvedAt: now,
        fssaiLicense: "DEV-TEST-FSSAI-001",
        isDevTestAccount: true,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const vendorId = vendorRes._id;

  const storeRes = await storesCol.findOneAndUpdate(
    { vendorId },
    {
      $setOnInsert: { _id: new ObjectId(), vendorId, activeOrderCount: 0, createdAt: now },
      $set: {
        storeName: "Vendor Test",
        addressLine: "Plot 1, Cyber Towers Test Hub, Madhapur",
        city: "Hyderabad",
        pincode: "500081",
        location: { type: "Point", coordinates: [lng, lat] },
        serviceRadiusKm,
        contactPhone: "9999999999",
        isOpen: true,
        isOnline: true,
        maxConcurrentOrders: 50,
        openingTime: "00:00",
        closingTime: "23:59",
        autoAcceptTimeoutSec: 90,
        isDevTestAccount: true,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const storeId = storeRes._id;

  // Seed canonical products
  await Promise.all(
    CANONICAL_PRODUCTS.map((p) =>
      productsCol.updateOne(
        { productId: p.productId },
        {
          $setOnInsert: { productId: p.productId, createdAt: now },
          $set: {
            name: p.name,
            category: p.category,
            image: p.image,
            basePrice: p.basePrice,
            netWeight: p.netWeight,
            variants: p.variants,
            isActive: true,
            updatedAt: now,
          },
        },
        { upsert: true }
      )
    )
  );

  // Seed full inventory for Vendor Test
  const invOps = CANONICAL_PRODUCTS.flatMap((p) =>
    p.variants.map((v) => ({
      updateOne: {
        filter: { storeId, productId: p.productId, variantId: v.id },
        update: {
          $set: {
            vendorId,
            storeId,
            productId: p.productId,
            variantId: v.id,
            stockQty: 100,
            reservedQty: 0,
            isAvailable: true,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    }))
  );
  await inventoryCol.bulkWrite(invOps, { ordered: false });

  console.log(
    JSON.stringify(
      {
        ok: true,
        storeName: "Vendor Test",
        vendorId: vendorId.toHexString(),
        storeId: storeId.toHexString(),
        userId: userId.toHexString(),
        coordinates: { lat, lng },
        serviceRadiusKm,
        inventoryItems: invOps.length,
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}
