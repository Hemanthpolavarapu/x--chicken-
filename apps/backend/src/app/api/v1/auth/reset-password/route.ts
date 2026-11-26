import { resetPasswordSchema } from "@x-chicken/shared";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { resetCustomerPassword } from "@/modules/auth/service";
import { parseRequestBody } from "@/validators/common";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("customer_reset_password", ip, 10, 15 * 60);

    const input = await parseRequestBody(request, resetPasswordSchema);
    await resetCustomerPassword(input.token, input.newPassword);

    return apiSuccess(
      { message: "Password updated successfully. Please log in with your new password." },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
