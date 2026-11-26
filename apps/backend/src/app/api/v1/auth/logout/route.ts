import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import {
  clearSessionCookie,
  COOKIE_NAMES,
  parseCookieHeader,
  revokeSessionByToken,
} from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const rawToken = parseCookieHeader(
      request.headers.get("cookie"),
      COOKIE_NAMES.CUSTOMER
    );
    await revokeSessionByToken(rawToken, "CUSTOMER");

    const response = apiSuccess({ loggedOut: true }, 200, request);
    clearSessionCookie(response, "CUSTOMER");
    return response;
  } catch (error) {
    return handleApiError(error, request);
  }
}
