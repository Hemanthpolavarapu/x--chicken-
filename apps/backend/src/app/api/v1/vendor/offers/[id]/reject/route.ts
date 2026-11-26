import { ObjectId } from "mongodb";
import { rejectOfferSchema, USER_ROLES } from "@x-chicken/shared";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { rejectVendorOffer } from "@/modules/dispatch/engine";
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

    const rawBody = await request.json().catch(() => ({}));
    const parsed = rejectOfferSchema.safeParse(rawBody);
    const reason = parsed.success ? parsed.data.reason : "Unable to fulfill right now";

    await rejectVendorOffer({
      offerId: new ObjectId(id),
      vendor: data.vendor,
      store: data.store,
      reason,
    });

    return applyCorsHeaders(request, apiSuccess({ rejected: true }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
