import { z } from "zod";
import { coordinatesSchema } from "./vendor";

export const orderItemInputSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).default("default"),
  quantity: z.number().int().min(1).max(50),
  cutPreference: z.string().trim().max(80).optional(),
});

export const deliveryAddressSchema = z.object({
  label: z.string().trim().min(1).max(40).default("Home"),
  recipientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  addressLine: z.string().trim().min(5, "Delivery address is required").max(250),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  coordinates: coordinatesSchema,
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "Cart cannot be empty").max(30),
  deliveryAddress: deliveryAddressSchema,
  promoCode: z.string().trim().max(30).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "ONLINE_PENDING"]).default("COD"),
  customerNotes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const rejectOfferSchema = z.object({
  reason: z.string().trim().min(2).max(200).default("Unable to fulfill right now"),
});

export const vendorOrderStatusSchema = z.object({
  status: z.enum([
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ]),
  note: z.string().trim().max(200).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(2).max(200).default("Cancelled by customer"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type RejectOfferInput = z.infer<typeof rejectOfferSchema>;
export type VendorOrderStatusInput = z.infer<typeof vendorOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
