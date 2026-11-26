import { updateStoreSchema, USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { PHASE3_COLLECTIONS, StoreDocument } from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import {
  getVendorAndStoreByUserId,
  toStoreDTO,
  toVendorDTO,
} from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }
    return applyCorsHeaders(
      request,
      apiSuccess({
        vendor: toVendorDTO(data.vendor),
        store: toStoreDTO(data.store),
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    const body = await request.json();
    const parsed = updateStoreSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid store update payload", 400, parsed.error.flatten());
    }

    const input = parsed.data;
    if ((input.isOnline === true || input.isOpen === true) && data.vendor.approvalStatus !== "APPROVED") {
      throw new ApiError(
        "FORBIDDEN",
        `Cannot go online/open while vendor approval status is ${data.vendor.approvalStatus}.`,
        403
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.storeName !== undefined) updates.storeName = input.storeName;
    if (input.addressLine !== undefined) updates.addressLine = input.addressLine;
    if (input.city !== undefined) updates.city = input.city;
    if (input.pincode !== undefined) updates.pincode = input.pincode;
    if (input.coordinates !== undefined) {
      updates.location = {
        type: "Point",
        coordinates: [input.coordinates.lng, input.coordinates.lat],
      };
    }
    if (input.serviceRadiusKm !== undefined) updates.serviceRadiusKm = input.serviceRadiusKm;
    if (input.contactPhone !== undefined) updates.contactPhone = input.contactPhone;
    if (input.isOpen !== undefined) updates.isOpen = input.isOpen;
    if (input.isOnline !== undefined) updates.isOnline = input.isOnline;
    if (input.maxConcurrentOrders !== undefined) updates.maxConcurrentOrders = input.maxConcurrentOrders;
    if (input.openingTime !== undefined) updates.openingTime = input.openingTime;
    if (input.closingTime !== undefined) updates.closingTime = input.closingTime;
    if (input.autoAcceptTimeoutSec !== undefined) updates.autoAcceptTimeoutSec = input.autoAcceptTimeoutSec;

    const storesCol = await getCollection<StoreDocument>(PHASE3_COLLECTIONS.STORES);
    const updatedStore = await storesCol.findOneAndUpdate(
      { _id: data.store._id! },
      { $set: updates },
      { returnDocument: "after" }
    );

    return applyCorsHeaders(
      request,
      apiSuccess({
        vendor: toVendorDTO(data.vendor),
        store: toStoreDTO(updatedStore!),
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
