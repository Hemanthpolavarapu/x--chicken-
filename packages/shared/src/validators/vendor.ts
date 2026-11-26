import { z } from "zod";
import { emailSchema, passwordSchema } from "./auth";

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const registerVendorSchema = z.object({
  ownerName: z.string().trim().min(2, "Owner name is required").max(80),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: passwordSchema,
  storeName: z.string().trim().min(2, "Store name is required").max(100),
  addressLine: z.string().trim().min(5, "Store address is required").max(250),
  city: z.string().trim().min(2, "City is required").max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  coordinates: coordinatesSchema,
  serviceRadiusKm: z.number().min(1).max(50).default(10),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit store contact number")
    .optional(),
  gstNumber: z.string().trim().max(20).optional().or(z.literal("")),
  fssaiLicense: z.string().trim().min(5, "FSSAI license is required").max(30),
});

export const updateStoreSchema = z.object({
  storeName: z.string().trim().min(2).max(100).optional(),
  addressLine: z.string().trim().min(5).max(250).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional(),
  coordinates: coordinatesSchema.optional(),
  serviceRadiusKm: z.number().min(1).max(50).optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  isOpen: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  maxConcurrentOrders: z.number().int().min(1).max(100).optional(),
  openingTime: z.string().trim().regex(/^\d{2}:\d{2}$/).optional(),
  closingTime: z.string().trim().regex(/^\d{2}:\d{2}$/).optional(),
  autoAcceptTimeoutSec: z.number().int().min(15).max(300).optional(),
});

export const updateVendorInventorySchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1).default("default"),
  stockQty: z.number().int().min(0).max(100000),
  isAvailable: z.boolean(),
  priceOverride: z.number().positive().max(50000).optional(),
});

export const adminVendorStatusSchema = z.object({
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  reason: z.string().trim().max(300).optional(),
});

export type RegisterVendorInput = z.infer<typeof registerVendorSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type UpdateVendorInventoryInput = z.infer<typeof updateVendorInventorySchema>;
export type AdminVendorStatusInput = z.infer<typeof adminVendorStatusSchema>;
