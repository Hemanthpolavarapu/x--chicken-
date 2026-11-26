import { USER_ROLES, updateCustomerProfileSchema } from "@x-chicken/shared";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { toPublicUser, updateCustomerProfile } from "@/modules/auth/service";
import { parseRequestBody } from "@/validators/common";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const { user } = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    return apiSuccess({ profile: toPublicUser(user) }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const { user } = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    const input = await parseRequestBody(request, updateCustomerProfileSchema);
    const updated = await updateCustomerProfile(user._id!, input);
    return apiSuccess({ profile: updated }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
