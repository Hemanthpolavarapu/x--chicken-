import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { acceptVendorOffer } from "@/modules/dispatch/engine";
import { toVendorOrderDTO } from "@/modules/orders/service";
import { getVendorAndStoreByUserId } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError("BAD_REQUEST", "Invalid offer ID.", 400);
    }

    const assignedOrder = await acceptVendorOffer({
      offerId: new ObjectId(id),
      vendor: data.vendor,
      store: data.store,
    });

    return applyCorsHeaders(request, apiSuccess({ order: toVendorOrderDTO(assignedOrder) }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
