import type { CreateOrderInput, OrderDTO, OrderItemDTO, VendorOrderDTO } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  OrderDocument,
  PHASE3_COLLECTIONS,
  ProductDocument,
} from "@/database/phase3Collections";
import { ApiError } from "@/lib/apiResponse";
import { ensureCanonicalProductsSeeded } from "@/modules/catalog/productsCatalog";

export const FREE_DELIVERY_THRESHOLD = 299;
export const STANDARD_DELIVERY_FEE = 29;

export function toOrderDTO(doc: OrderDocument): OrderDTO {
  return {
    id: doc._id!.toHexString(),
    orderNumber: doc.orderNumber,
    customerId: doc.customerId.toHexString(),
    customerName: doc.customerName,
    customerPhone: doc.customerPhone,
    vendorId: doc.vendorId?.toHexString(),
    storeId: doc.storeId?.toHexString(),
    storeName: doc.storeName,
    status: doc.status,
    dispatchStatus: doc.dispatchStatus,
    items: doc.items,
    subtotal: doc.subtotal,
    deliveryFee: doc.deliveryFee,
    discount: doc.discount,
    promoCode: doc.promoCode,
    totalAmount: doc.totalAmount,
    paymentMethod: doc.paymentMethod,
    deliveryAddress: {
      label: doc.deliveryAddress.label,
      recipientName: doc.deliveryAddress.recipientName,
      phone: doc.deliveryAddress.phone,
      addressLine: doc.deliveryAddress.addressLine,
      landmark: doc.deliveryAddress.landmark,
      city: doc.deliveryAddress.city,
      pincode: doc.deliveryAddress.pincode,
      coordinates: {
        lat: doc.deliveryAddress.location.coordinates[1],
        lng: doc.deliveryAddress.location.coordinates[0],
      },
    },
    customerNotes: doc.customerNotes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toVendorOrderDTO(doc: OrderDocument): VendorOrderDTO {
  return {
    id: doc._id!.toHexString(),
    orderNumber: doc.orderNumber,
    vendorId: doc.vendorId?.toHexString(),
    storeId: doc.storeId?.toHexString(),
    storeName: doc.storeName,
    status: doc.status,
    dispatchStatus: doc.dispatchStatus,
    items: doc.items,
    subtotal: doc.subtotal,
    totalAmount: doc.totalAmount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function calculateOrderPricing(input: CreateOrderInput): Promise<{
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode?: string;
  totalAmount: number;
}> {
  await ensureCanonicalProductsSeeded();
  const productCol = await getCollection<ProductDocument>(PHASE3_COLLECTIONS.PRODUCTS);

  const productIds = Array.from(new Set(input.items.map((i) => i.productId)));
  const products = await productCol
    .find({ productId: { $in: productIds }, isActive: true })
    .toArray();
  const productMap = new Map(products.map((p) => [p.productId, p]));

  const resolvedItems: OrderItemDTO[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ApiError("BAD_REQUEST", `Product '${item.productId}' is unavailable.`, 400);
    }
    const matchedVariant =
      product.variants.find((v) => v.id === item.variantId) || product.variants[0];
    const unitPrice = matchedVariant ? matchedVariant.price : product.basePrice;
    const variantId = matchedVariant ? matchedVariant.id : "default";
    const variantLabel = matchedVariant ? matchedVariant.label : product.netWeight;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    resolvedItems.push({
      productId: product.productId,
      variantId,
      name: product.name,
      variantLabel,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      cutPreference: item.cutPreference,
    });
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const normalizedPromo = input.promoCode?.trim().toUpperCase();
  let discount = 0;
  let appliedPromo: string | undefined;

  if (normalizedPromo === "EXPRESS50") {
    if (subtotal < 200) {
      throw new ApiError("BAD_REQUEST", "Cart subtotal must be at least ₹200 for EXPRESS50.", 400);
    }
    discount = 50;
    appliedPromo = "EXPRESS50";
  } else if (normalizedPromo === "FRESH10") {
    discount = Math.round(subtotal * 0.1);
    appliedPromo = "FRESH10";
  } else if (normalizedPromo) {
    throw new ApiError("BAD_REQUEST", "Invalid promo code.", 400);
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);
  return {
    items: resolvedItems,
    subtotal,
    deliveryFee,
    discount,
    promoCode: appliedPromo,
    totalAmount,
  };
}
