import { ObjectId } from "mongodb";
import { adminVendorStatusSchema, USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  PHASE3_COLLECTIONS,
  StoreDocument,
  VendorDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { createNotification } from "@/modules/notifications/service";
import { toVendorDTO } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "ADMIN", [USER_ROLES.ADMIN]);
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError("BAD_REQUEST", "Invalid vendor ID.", 400);
    }

    const body = await request.json();
    const parsed = adminVendorStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid vendor status payload", 400, parsed.error.flatten());
    }

    const vendorsCol = await getCollection<VendorDocument>(PHASE3_COLLECTIONS.VENDORS);
    const storesCol = await getCollection<StoreDocument>(PHASE3_COLLECTIONS.STORES);
    const now = new Date();

    const updated = await vendorsCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: parsed.data.approvalStatus,
          approvalReason: parsed.data.reason,
          approvedBy: auth.user._id!,
          approvedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    if (!updated) {
      throw new ApiError("NOT_FOUND", "Vendor not found.", 404);
    }

    if (parsed.data.approvalStatus !== "APPROVED") {
      await storesCol.updateOne(
        { vendorId: updated._id! },
        { $set: { isOnline: false, isOpen: false, updatedAt: now } }
      );
    }

    await createNotification({
      recipientId: updated.userId,
      recipientRole: "VENDOR",
      type: "VENDOR_APPROVAL_UPDATED",
      title: `Store ${parsed.data.approvalStatus}`,
      message:
        parsed.data.approvalStatus === "APPROVED"
          ? "Your store has been approved by Admin! You can now go online and accept customer orders."
          : `Your vendor account status changed to ${parsed.data.approvalStatus}.`,
    });

    return applyCorsHeaders(request, apiSuccess({ vendor: toVendorDTO(updated) }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
