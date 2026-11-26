import { USER_ROLES } from "@x-chicken/shared";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { handleCorsPreflight } from "@/middleware/cors";
import { toPublicUser } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const { user } = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    return apiSuccess({ user: toPublicUser(user) }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
