import { ObjectId } from "mongodb";
import type { StoreDTO, VendorDTO } from "@x-chicken/shared";
import { getCollection, getDatabase } from "@/database/client";
import { COLLECTIONS, ensureAuthIndexes, UserDocument } from "@/database/collections";
import {
  ensurePhase3Indexes,
  InventoryDocument,
  PHASE3_COLLECTIONS,
  ProductDocument,
  StoreDocument,
  VendorDocument,
} from "@/database/phase3Collections";
import { ensureCanonicalProductsSeeded } from "@/modules/catalog/productsCatalog";

export function toVendorDTO(doc: VendorDocument): VendorDTO {
  return {
    id: doc._id!.toHexString(),
    userId: doc.userId.toHexString(),
    ownerName: doc.ownerName,
    email: doc.email,
    phone: doc.phone,
    approvalStatus: doc.approvalStatus,
    approvalReason: doc.approvalReason,
    gstNumber: doc.gstNumber,
    fssaiLicense: doc.fssaiLicense,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toStoreDTO(doc: StoreDocument): StoreDTO {
  return {
    id: doc._id!.toHexString(),
    vendorId: doc.vendorId.toHexString(),
    storeName: doc.storeName,
    addressLine: doc.addressLine,
    city: doc.city,
    pincode: doc.pincode,
    coordinates: {
      lat: doc.location.coordinates[1],
      lng: doc.location.coordinates[0],
    },
    serviceRadiusKm: doc.serviceRadiusKm,
    contactPhone: doc.contactPhone,
    isOpen: doc.isOpen,
    isOnline: doc.isOnline,
    activeOrderCount: doc.activeOrderCount,
    maxConcurrentOrders: doc.maxConcurrentOrders,
    openingTime: doc.openingTime,
    closingTime: doc.closingTime,
    autoAcceptTimeoutSec: doc.autoAcceptTimeoutSec,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getVendorAndStoreByUserId(userId: ObjectId): Promise<{
  vendor: VendorDocument;
  store: StoreDocument;
} | null> {
  const db = await getDatabase();
  await Promise.all([ensureAuthIndexes(db), ensurePhase3Indexes(db)]);
  const vendorCol = db.collection<VendorDocument>(PHASE3_COLLECTIONS.VENDORS);
  const storeCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);
  const vendor = await vendorCol.findOne({ userId });
  if (!vendor || !vendor._id) return null;
  const store = await storeCol.findOne({ vendorId: vendor._id });
  if (!store) return null;
  return { vendor, store };
}

export async function initializeStoreInventory(
  vendorId: ObjectId,
  storeId: ObjectId
): Promise<void> {
  await ensureCanonicalProductsSeeded();
  const productCol = await getCollection<ProductDocument>(PHASE3_COLLECTIONS.PRODUCTS);
  const inventoryCol = await getCollection<InventoryDocument>(PHASE3_COLLECTIONS.INVENTORY);
  const products = await productCol.find({ isActive: true }).toArray();
  const now = new Date();
  const ops = products.flatMap((p) => {
    const variants = p.variants.length > 0 ? p.variants : [{ id: "default" }];
    return variants.map((v) => ({
      updateOne: {
        filter: { storeId, productId: p.productId, variantId: v.id },
        update: {
          $setOnInsert: {
            vendorId,
            storeId,
            productId: p.productId,
            variantId: v.id,
            stockQty: 25,
            reservedQty: 0,
            isAvailable: true,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    }));
  });
  if (ops.length > 0) {
    await inventoryCol.bulkWrite(ops, { ordered: false });
  }
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const col = await getCollection<UserDocument>(COLLECTIONS.USERS);
  return col.findOne({ email: email.trim().toLowerCase() });
}
