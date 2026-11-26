import type { UserRole } from "@x-chicken/shared";
import { UserDocument } from "@/database/collections";
import { ApiError } from "@/lib/apiResponse";
import {
  COOKIE_NAMES,
  parseCookieHeader,
  SessionScope,
  validateSession,
} from "@/modules/auth/session";

export interface AuthenticatedContext {
  user: UserDocument;
  rawToken: string;
}

/**
 * Server-enforced RBAC guard.
 * Validates the HTTP-only session cookie against MongoDB and enforces
 * explicit role authorization. Never trusts frontend-supplied roles.
 */
export async function requireRole(
  request: Request,
  scope: SessionScope,
  allowedRoles: UserRole[]
): Promise<AuthenticatedContext> {
  const cookieHeader = request.headers.get("cookie");
  const cookieName = COOKIE_NAMES[scope];
  const rawToken = parseCookieHeader(cookieHeader, cookieName);

  if (!rawToken) {
    // If an authenticated Customer attempts to access an Admin endpoint, return 403
    if (scope === "ADMIN") {
      const custToken = parseCookieHeader(cookieHeader, COOKIE_NAMES.CUSTOMER);
      const custSession = await validateSession(custToken, "CUSTOMER");
      if (custSession) {
        throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
      }
    }
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const result = await validateSession(rawToken, scope);
  if (!result) {
    throw new ApiError("UNAUTHORIZED", "Session expired or invalid", 401);
  }

  if (!allowedRoles.includes(result.user.role)) {
    throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
  }

  return { user: result.user, rawToken };
}
