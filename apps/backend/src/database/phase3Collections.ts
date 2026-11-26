import { Db, ObjectId } from "mongodb";
import type {
  DispatchStatus,
  GeoPoint,
  OfferStatus,
  OrderItemDTO,
  OrderStatus,
  UserRole,
  VendorApprovalStatus,
} from "@x-chicken/shared";

export const PHASE3_COLLECTIONS = {
  VENDORS: "vendors",
  STORES: "stores",
  PRODUCTS: "products",
  INVENTORY: "inventory",
  ORDERS: "orders",
  ORDER_DISPATCHES: "order_dispatches",
  VENDOR_ORDER_OFFERS: "vendor_order_offers",
  NOTIFICATIONS: "notifications",
  ORDER_EVENTS: "order_events",
} as const;

export interface VendorDocument {
  _id?: ObjectId;
  userId: ObjectId;
  ownerName: string;
  email: string;
  phone: string;
  approvalStatus: VendorApprovalStatus;
  approvalReason?: string;
  approvedBy?: ObjectId;
  approvedAt?: Date;
  gstNumber?: string;
  fssaiLicense: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreDocument {
  _id?: ObjectId;
  vendorId: ObjectId;
  storeName: string;
  addressLine: string;
  city: string;
  pincode: string;
  location: GeoPoint;
  serviceRadiusKm: number;
  contactPhone: string;
  isOpen: boolean;
  isOnline: boolean;
  activeOrderCount: number;
  maxConcurrentOrders: number;
  openingTime: string;
  closingTime: string;
  autoAcceptTimeoutSec: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantDoc {
  id: string;
  label: string;
  netWeight: string;
  price: number;
  originalPrice: number;
}

export interface ProductDocument {
  _id?: ObjectId;
  productId: string;
  name: string;
  category: string;
  image: string;
  basePrice: number;
  netWeight: string;
  variants: ProductVariantDoc[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryDocument {
  _id?: ObjectId;
  vendorId: ObjectId;
  storeId: ObjectId;
  productId: string;
  variantId: string;
  stockQty: number;
  reservedQty: number;
  isAvailable: boolean;
  priceOverride?: number;
  updatedAt: Date;
}

export interface OrderDocument {
  _id?: ObjectId;
  orderNumber: string;
  idempotencyKey: string;
  customerId: ObjectId;
  customerName: string;
  customerPhone: string;
  vendorId?: ObjectId;
  storeId?: ObjectId;
  storeName?: string;
  status: OrderStatus;
  dispatchStatus: DispatchStatus;
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode?: string;
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE_PENDING";
  deliveryAddress: {
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    landmark?: string;
    city: string;
    pincode: string;
    location: GeoPoint;
  };
  customerNotes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDispatchDocument {
  _id?: ObjectId;
  orderId: ObjectId;
  orderNumber: string;
  status: DispatchStatus;
  attemptCount: number;
  currentOfferId?: ObjectId;
  currentVendorId?: ObjectId;
  currentStoreId?: ObjectId;
  offerExpiresAt?: Date;
  attemptedVendorIds: ObjectId[];
  assignedVendorId?: ObjectId;
  assignedStoreId?: ObjectId;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorOrderOfferDocument {
  _id?: ObjectId;
  orderId: ObjectId;
  orderNumber: string;
  dispatchId: ObjectId;
  vendorId: ObjectId;
  storeId: ObjectId;
  status: OfferStatus;
  attemptNumber: number;
  distanceKm: number;
  offeredAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
}

export interface NotificationDocument {
  _id?: ObjectId;
  recipientId: ObjectId;
  recipientRole: UserRole;
  type: string;
  title: string;
  message: string;
  orderId?: ObjectId;
  offerId?: ObjectId;
  isRead: boolean;
  createdAt: Date;
}

export interface OrderEventDocument {
  _id?: ObjectId;
  orderId: ObjectId;
  actorId?: ObjectId;
  actorRole: UserRole | "SYSTEM";
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

let phase3IndexesPromise: Promise<void> | null = null;

export async function ensurePhase3Indexes(db: Db): Promise<void> {
  if (!phase3IndexesPromise) {
    phase3IndexesPromise = (async () => {
      await Promise.all([
        db.collection(PHASE3_COLLECTIONS.VENDORS).createIndexes([
          { key: { userId: 1 }, unique: true },
          { key: { email: 1 }, unique: true },
          { key: { approvalStatus: 1, createdAt: -1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.STORES).createIndexes([
          { key: { vendorId: 1 }, unique: true },
          { key: { location: "2dsphere" } },
          { key: { isOnline: 1, isOpen: 1, activeOrderCount: 1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.PRODUCTS).createIndexes([
          { key: { productId: 1 }, unique: true },
          { key: { category: 1, isActive: 1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.INVENTORY).createIndexes([
          { key: { storeId: 1, productId: 1, variantId: 1 }, unique: true },
          { key: { vendorId: 1, isAvailable: 1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.ORDERS).createIndexes([
          { key: { orderNumber: 1 }, unique: true },
          { key: { idempotencyKey: 1 }, unique: true },
          { key: { customerId: 1, createdAt: -1 } },
          { key: { vendorId: 1, status: 1, createdAt: -1 } },
          { key: { status: 1, createdAt: -1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.ORDER_DISPATCHES).createIndexes([
          { key: { orderId: 1 }, unique: true },
          { key: { status: 1, offerExpiresAt: 1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS).createIndexes([
          { key: { orderId: 1, vendorId: 1, attemptNumber: 1 }, unique: true },
          { key: { vendorId: 1, status: 1, offeredAt: -1 } },
          { key: { status: 1, expiresAt: 1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.NOTIFICATIONS).createIndexes([
          { key: { recipientId: 1, recipientRole: 1, createdAt: -1 } },
          { key: { recipientId: 1, isRead: 1, createdAt: -1 } },
        ]),
        db.collection(PHASE3_COLLECTIONS.ORDER_EVENTS).createIndexes([
          { key: { orderId: 1, createdAt: 1 } },
        ]),
      ]);
    })().catch((err) => {
      phase3IndexesPromise = null;
      throw err;
    });
  }
  return phase3IndexesPromise;
}
