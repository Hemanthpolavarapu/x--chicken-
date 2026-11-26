export const USER_ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type AccountStatus = "ACTIVE" | "SUSPENDED";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
}

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type VendorApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type OrderStatus =
  | "PENDING"
  | "SEARCHING"
  | "OFFERED"
  | "ASSIGNED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "NO_VENDOR_AVAILABLE"
  | "CANCELLED";

export type OfferStatus = "OFFERED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "SUPERSEDED";

export type DispatchStatus =
  | "PENDING"
  | "SEARCHING"
  | "OFFERED"
  | "ASSIGNED"
  | "NO_VENDOR_AVAILABLE"
  | "CANCELLED";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface VendorDTO {
  id: string;
  userId: string;
  ownerName: string;
  email: string;
  phone: string;
  approvalStatus: VendorApprovalStatus;
  approvalReason?: string;
  gstNumber?: string;
  fssaiLicense: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreDTO {
  id: string;
  vendorId: string;
  storeName: string;
  addressLine: string;
  city: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  serviceRadiusKm: number;
  contactPhone: string;
  isOpen: boolean;
  isOnline: boolean;
  activeOrderCount: number;
  maxConcurrentOrders: number;
  openingTime: string;
  closingTime: string;
  autoAcceptTimeoutSec: number;
  updatedAt: string;
}

export interface OrderItemDTO {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  cutPreference?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vendorId?: string;
  storeId?: string;
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
    coordinates: { lat: number; lng: number };
  };
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOrderDTO {
  id: string;
  orderNumber: string;
  vendorId?: string;
  storeId?: string;
  storeName?: string;
  status: OrderStatus;
  dispatchStatus: DispatchStatus;
  items: OrderItemDTO[];
  subtotal: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOfferDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  storeId: string;
  status: OfferStatus;
  attemptNumber: number;
  distanceKm: number;
  offeredAt: string;
  expiresAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  orderSummary: {
    items: OrderItemDTO[];
    totalAmount: number;
  };
}

export interface NotificationDTO {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  offerId?: string;
  isRead: boolean;
  createdAt: string;
}

