import { loginSchema, USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import { COLLECTIONS, ensureAuthIndexes, UserDocument } from "@/database/collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { verifyPassword } from "@/modules/auth/password";
import { createSession, setSessionCookie } from "@/modules/auth/session";
import {
  getVendorAndStoreByUserId,
  toStoreDTO,
  toVendorDTO,
} from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("vendor_login", ip, 20, 15 * 60);

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid email or password format", 400, parsed.error.flatten());
    }

    const email = parsed.data.email.toLowerCase();
    const db = await getDatabase();
    await ensureAuthIndexes(db);
    const usersCol = db.collection<UserDocument>(COLLECTIONS.USERS);

    const user = await usersCol.findOne({ email, role: USER_ROLES.VENDOR });
    if (!user || !user._id) {
      throw new ApiError("UNAUTHORIZED", "Invalid vendor email or password.", 401);
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError("FORBIDDEN", "This vendor account has been suspended.", 403);
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new ApiError(
        "TOO_MANY_REQUESTS",
        "Account temporarily locked due to repeated failed login attempts. Try again later.",
        423
      );
    }

    const passwordValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordValid) {
      const nextAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;
      await usersCol.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: nextAttempts,
            lockedUntil: shouldLock ? new Date(now.getTime() + LOCK_DURATION_MS) : undefined,
            updatedAt: now,
          },
        }
      );
      if (shouldLock) {
        throw new ApiError(
          "TOO_MANY_REQUESTS",
          "Account locked for 15 minutes after repeated failed attempts.",
          423
        );
      }
      throw new ApiError("UNAUTHORIZED", "Invalid vendor email or password.", 401);
    }

    await usersCol.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: 0,
          updatedAt: now,
        },
        $unset: { lockedUntil: "" },
      }
    );

    const vendorStore = await getVendorAndStoreByUserId(user._id);
    if (!vendorStore) {
      throw new ApiError("NOT_FOUND", "Vendor store profile not found.", 404);
    }

    const rawToken = await createSession({
      userId: user._id,
      role: USER_ROLES.VENDOR,
      scope: "VENDOR",
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip,
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
