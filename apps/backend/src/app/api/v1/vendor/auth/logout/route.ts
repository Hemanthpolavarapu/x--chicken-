import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import {
  clearSessionCookie,
  COOKIE_NAMES,
  parseCookieHeader,
  revokeSessionByToken,
} from "@/modules/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const rawToken = parseCookieHeader(request.headers.get("cookie"), COOKIE_NAMES.VENDOR);
    if (rawToken) {
      await revokeSessionByToken(rawToken, "VENDOR");
    }
    const response = apiSuccess({ loggedOut: true });
    clearSessionCookie(response, "VENDOR");
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
