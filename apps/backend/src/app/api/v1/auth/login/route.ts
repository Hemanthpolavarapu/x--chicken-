import { loginSchema } from "@x-chicken/shared";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { authenticateUser } from "@/modules/auth/service";
import { setSessionCookie } from "@/modules/auth/session";
import { parseRequestBody } from "@/validators/common";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("customer_login", ip, 15, 15 * 60);

    const input = await parseRequestBody(request, loginSchema);
    const { user, sessionToken } = await authenticateUser(input, "CUSTOMER", {
      ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    const response = apiSuccess({ user }, 200, request);
    setSessionCookie(response, "CUSTOMER", sessionToken);
    return response;
  } catch (error) {
    return handleApiError(error, request);
  }
}
