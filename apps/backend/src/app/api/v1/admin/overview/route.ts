import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { COLLECTIONS, SessionDocument, UserDocument } from "@/database/collections";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { handleCorsPreflight } from "@/middleware/cors";
import { toPublicUser } from "@/modules/auth/service";

export const dynamic = "force-dynamic";

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const { user } = await requireRole(request, "ADMIN", [USER_ROLES.ADMIN]);

    const users = await getCollection<UserDocument>(COLLECTIONS.USERS);
    const sessions = await getCollection<SessionDocument>(COLLECTIONS.SESSIONS);

    const [totalCustomers, totalAdmins, activeSessions, recentCustomers] =
      await Promise.all([
        users.countDocuments({ role: USER_ROLES.CUSTOMER }),
        users.countDocuments({ role: USER_ROLES.ADMIN }),
        sessions.countDocuments({
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        }),
        users
          .find({ role: USER_ROLES.CUSTOMER })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
      ]);

    return apiSuccess(
      {
        admin: toPublicUser(user),
        metrics: {
          totalCustomers,
          totalAdmins,
          activeSessions,
        },
        recentCustomers: recentCustomers.map(toPublicUser),
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
