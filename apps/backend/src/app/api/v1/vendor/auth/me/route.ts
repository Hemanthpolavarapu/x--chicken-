import { USER_ROLES } from "@x-chicken/shared";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
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
    const vendorStore = await getVendorAndStoreByUserId(auth.user._id!);
    if (!vendorStore) {
      throw new ApiError("NOT_FOUND", "Vendor profile not found.", 404);
    }
    const response = apiSuccess({
      user: {
        id: auth.user._id!.toHexString(),
        email: auth.user.email,
        name: auth.user.name,
        phone: auth.user.phone,
        role: auth.user.role,
        status: auth.user.status,
        createdAt: auth.user.createdAt.toISOString(),
      },
      vendor: toVendorDTO(vendorStore.vendor),
      store: toStoreDTO(vendorStore.store),
    });
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
