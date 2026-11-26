import { USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  OrderDispatchDocument,
  OrderDocument,
  PHASE3_COLLECTIONS,
} from "@/database/phase3Collections";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
import { expireStaleOffers } from "@/modules/dispatch/engine";
import { toOrderDTO } from "@/modules/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    await requireRole(request, "ADMIN", [USER_ROLES.ADMIN]);
    await expireStaleOffers();

    const db = await getDatabase();
    await ensurePhase3Indexes(db);
    const ordersCol = db.collection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const dispatchCol = db.collection<OrderDispatchDocument>(
      PHASE3_COLLECTIONS.ORDER_DISPATCHES
    );

    const orders = await ordersCol.find({}).sort({ createdAt: -1 }).limit(100).toArray();
    const dispatches = await dispatchCol
      .find({ orderId: { $in: orders.map((o) => o._id!) } })
      .toArray();
    const dispatchMap = new Map(dispatches.map((d) => [d.orderId.toHexString(), d]));

    const items = orders.map((order) => {
      const dispatch = dispatchMap.get(order._id!.toHexString());
      return {
        order: toOrderDTO(order),
        dispatch: dispatch
          ? {
              status: dispatch.status,
              attemptCount: dispatch.attemptCount,
              attemptedVendorCount: dispatch.attemptedVendorIds.length,
              currentVendorId: dispatch.currentVendorId?.toHexString(),
              offerExpiresAt: dispatch.offerExpiresAt?.toISOString(),
              failureReason: dispatch.failureReason,
            }
          : null,
      };
    });

    return applyCorsHeaders(request, apiSuccess({ orders: items }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
