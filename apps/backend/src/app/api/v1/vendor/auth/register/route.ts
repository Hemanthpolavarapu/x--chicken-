import { ObjectId } from "mongodb";
import { registerVendorSchema, USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import { COLLECTIONS, ensureAuthIndexes, UserDocument } from "@/database/collections";
import {
  ensurePhase3Indexes,
  PHASE3_COLLECTIONS,
  StoreDocument,
  VendorDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { hashPassword } from "@/modules/auth/password";
import { createSession, setSessionCookie } from "@/modules/auth/session";
import {
  initializeStoreInventory,
  toStoreDTO,
  toVendorDTO,
} from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("vendor_register", ip, 10, 15 * 60);

    const body = await request.json();
    const parsed = registerVendorSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid vendor registration input", 400, parsed.error.flatten());
    }

    const input = parsed.data;
    const email = input.email.toLowerCase();

    const db = await getDatabase();
    await Promise.all([ensureAuthIndexes(db), ensurePhase3Indexes(db)]);

    const usersCol = db.collection<UserDocument>(COLLECTIONS.USERS);
    const vendorsCol = db.collection<VendorDocument>(PHASE3_COLLECTIONS.VENDORS);
    const storesCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);

    const existing = await usersCol.findOne({ email });
    if (existing) {
      throw new ApiError("CONFLICT", "An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const now = new Date();
    const userId = new ObjectId();

    await usersCol.insertOne({
      _id: userId,
      email,
      name: input.ownerName,
      phone: input.phone,
      passwordHash,
      role: USER_ROLES.VENDOR,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    });

    const vendorDoc: VendorDocument = {
      _id: new ObjectId(),
      userId,
      ownerName: input.ownerName,
      email,
      phone: input.phone,
      approvalStatus: "PENDING",
      gstNumber: input.gstNumber || undefined,
      fssaiLicense: input.fssaiLicense,
      createdAt: now,
      updatedAt: now,
    };
    await vendorsCol.insertOne(vendorDoc);

    const storeDoc: StoreDocument = {
      _id: new ObjectId(),
      vendorId: vendorDoc._id!,
      storeName: input.storeName,
      addressLine: input.addressLine,
      city: input.city,
      pincode: input.pincode,
      location: {
        type: "Point",
        coordinates: [input.coordinates.lng, input.coordinates.lat],
      },
      serviceRadiusKm: input.serviceRadiusKm,
      contactPhone: input.contactPhone || input.phone,
      isOpen: false,
      isOnline: false,
      activeOrderCount: 0,
      maxConcurrentOrders: 10,
      openingTime: "07:00",
      closingTime: "22:00",
      autoAcceptTimeoutSec: 60,
      createdAt: now,
      updatedAt: now,
    };
    await storesCol.insertOne(storeDoc);

    await initializeStoreInventory(vendorDoc._id!, storeDoc._id!);

    const rawToken = await createSession({
      userId,
      role: USER_ROLES.VENDOR,
      scope: "VENDOR",
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip,
    });

    const response = apiSuccess(
      {
        user: {
          id: userId.toHexString(),
          email,
          name: input.ownerName,
          phone: input.phone,
          role: USER_ROLES.VENDOR,
          status: "ACTIVE" as const,
          createdAt: now.toISOString(),
        },
        vendor: toVendorDTO(vendorDoc),
        store: toStoreDTO(storeDoc),
      },
      201
    );
    setSessionCookie(response, "VENDOR", rawToken);
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
