import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { applyCorsHeaders } from "@/middleware/cors";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function apiSuccess<T>(data: T, status = 200, request?: Request) {
  const res = NextResponse.json(
    {
      ok: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
  return request ? applyCorsHeaders(request, res) : res;
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status = 500,
  details?: unknown,
  request?: Request
) {
  const res = NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
  return request ? applyCorsHeaders(request, res) : res;
}

export function handleApiError(error: unknown, request?: Request) {
  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid request payload",
      400,
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      request
    );
  }

  if (error instanceof ApiError) {
    return apiError(error.code, error.message, error.status, error.details, request);
  }

  console.error("[API] Unhandled error:", error);
  return apiError(
    "INTERNAL_ERROR",
    "An unexpected server error occurred",
    500,
    undefined,
    request
  );
}
