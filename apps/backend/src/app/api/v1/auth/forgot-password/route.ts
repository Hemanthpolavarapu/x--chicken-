import { forgotPasswordSchema } from "@x-chicken/shared";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { requestCustomerPasswordReset } from "@/modules/auth/service";
import { parseRequestBody } from "@/validators/common";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("customer_forgot_password", ip, 5, 15 * 60);

    const input = await parseRequestBody(request, forgotPasswordSchema);
    const result = await requestCustomerPasswordReset(input.email);

    return apiSuccess(
      {
        message: "If an account exists for this email, a password reset token has been generated.",
        ...(result.devResetToken ? { devResetToken: result.devResetToken } : {}),
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
