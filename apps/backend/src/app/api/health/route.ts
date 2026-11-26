import { pingDatabase } from "@/database/client";
import { apiSuccess, apiError, handleApiError } from "@/lib/apiResponse";
import { handleCorsPreflight } from "@/middleware/cors";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const dbStatus = await pingDatabase();

    if (!dbStatus.configured) {
      return apiError(
        "SERVICE_UNAVAILABLE",
        "Database is not configured",
        503,
        { service: "x-chicken-api", database: "not_configured" },
        request
      );
    }

    if (!dbStatus.connected) {
      return apiError(
        "SERVICE_UNAVAILABLE",
        "Database connection unavailable",
        503,
        { service: "x-chicken-api", database: "unreachable" },
        request
      );
    }

    return apiSuccess(
      {
        service: "x-chicken-api",
        status: "healthy",
        database: "connected",
        latencyMs: dbStatus.latencyMs,
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
