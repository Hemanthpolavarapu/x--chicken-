import { USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import { COLLECTIONS, ensureAuthIndexes, UserDocument } from "@/database/collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { getClientIp } from "@/middleware/rateLimit";
import { verifyPassword } from "@/modules/auth/password";
import { createSession, setSessionCookie } from "@/modules/auth/session";
import {
  getVendorAndStoreByUserId,
  toStoreDTO,
  toVendorDTO,
} from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertDevTestVendorEnabled() {
  const previewTestVendorEnabled =
    process.env.VERCEL_ENV === "preview" &&
    process.env.ENABLE_DEV_TEST_VENDOR === "true";
  const localTestVendorEnabled =
    process.env.VERCEL_ENV !== "production" &&
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_TEST_VENDOR === "true";

  if (!previewTestVendorEnabled && !localTestVendorEnabled) {
    throw new ApiError("NOT_FOUND", "Not found", 404);
  }

  if (previewTestVendorEnabled) {
    const appDatabase = process.env.MONGODB_DB_NAME?.trim();
    const previewDatabase = process.env.DEV_TEST_VENDOR_DB_NAME?.trim();
    const productionDatabase = process.env.PRODUCTION_MONGODB_DB_NAME?.trim();

    if (
      !appDatabase ||
      !previewDatabase ||
      !productionDatabase ||
      appDatabase !== previewDatabase ||
      previewDatabase === productionDatabase
    ) {
      throw new ApiError("NOT_FOUND", "Not found", 404);
    }
  }
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertDevTestVendorEnabled();
    assertTrustedOrigin(request);

    const testEmail = (process.env.TEST_VENDOR_EMAIL || "").trim().toLowerCase();
    const testPassword = process.env.TEST_VENDOR_PASSWORD || "";
    if (!testEmail || !testPassword) {
      throw new ApiError("NOT_FOUND", "Test vendor not configured", 404);
    }

    const db = await getDatabase();
    await ensureAuthIndexes(db);
    const usersCol = db.collection<UserDocument>(COLLECTIONS.USERS);

    const user = await usersCol.findOne({ email: testEmail, role: USER_ROLES.VENDOR });
    if (!user || !user._id || user.status !== "ACTIVE") {
      throw new ApiError(
        "NOT_FOUND",
        "Vendor Test account is not provisioned. Run pnpm --filter @x-chicken/backend provision:test-vendor.",
        404
      );
    }

    const passwordValid = await verifyPassword(testPassword, user.passwordHash);
    if (!passwordValid) {
      throw new ApiError("UNAUTHORIZED", "Test vendor credentials mismatch.", 401);
    }

    const vendorStore = await getVendorAndStoreByUserId(user._id);
    if (!vendorStore || vendorStore.vendor.approvalStatus !== "APPROVED") {
      throw new ApiError("FORBIDDEN", "Vendor Test store is not approved.", 403);
    }

    const rawToken = await createSession({
      userId: user._id,
      role: USER_ROLES.VENDOR,
      scope: "VENDOR",
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip: getClientIp(request),
    });

    const response = apiSuccess({
      user: {
        id: user._id.toHexString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
      vendor: toVendorDTO(vendorStore.vendor),
      store: toStoreDTO(vendorStore.store),
    });
    setSessionCookie(response, "VENDOR", rawToken);
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
