import { NextResponse } from "next/server";
import { getAllowedOrigins } from "@/config/env";
import { ApiError } from "@/lib/apiResponse";

export function isOriginAllowed(origin: string | null): origin is string {
  if (!origin) return false;
  const normalized = origin.trim().replace(/\/+$/, "");
  return getAllowedOrigins().includes(normalized);
}

export function applyCorsHeaders(request: Request, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  response.headers.set("Vary", "Origin");

  if (isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Idempotency-Key, X-Idempotency-Key"
    );
  }

  return response;
}

export function handleCorsPreflight(request: Request): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  const res = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(request, res);
}

/**
 * CSRF protection for cookie-authenticated state-changing requests.
 * Rejects requests bearing an untrusted Origin header.
 */
export function assertTrustedOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && !isOriginAllowed(origin)) {
    throw new ApiError("FORBIDDEN", "Untrusted request origin", 403);
  }
}
