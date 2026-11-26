import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { NotificationDocument, PHASE3_COLLECTIONS } from "@/database/phase3Collections";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { toNotificationDTO } from "@/modules/notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const col = await getCollection<NotificationDocument>(PHASE3_COLLECTIONS.NOTIFICATIONS);

    const [items, unreadCount] = await Promise.all([
      col
        .find({ recipientId: auth.user._id!, recipientRole: USER_ROLES.VENDOR })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
      col.countDocuments({
        recipientId: auth.user._id!,
        recipientRole: USER_ROLES.VENDOR,
        isRead: false,
      }),
    ]);

    return applyCorsHeaders(
      request,
      apiSuccess({
        notifications: items.map(toNotificationDTO),
        unreadCount,
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const body = await request.json().catch(() => ({}));
    const col = await getCollection<NotificationDocument>(PHASE3_COLLECTIONS.NOTIFICATIONS);

    if (typeof body?.notificationId === "string" && ObjectId.isValid(body.notificationId)) {
      await col.updateOne(
        {
          _id: new ObjectId(body.notificationId),
          recipientId: auth.user._id!,
          recipientRole: USER_ROLES.VENDOR,
        },
        { $set: { isRead: true } }
      );
    } else {
      await col.updateMany(
        { recipientId: auth.user._id!, recipientRole: USER_ROLES.VENDOR, isRead: false },
        { $set: { isRead: true } }
      );
    }

    const unreadCount = await col.countDocuments({
      recipientId: auth.user._id!,
      recipientRole: USER_ROLES.VENDOR,
      isRead: false,
    });

    return applyCorsHeaders(request, apiSuccess({ unreadCount }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
