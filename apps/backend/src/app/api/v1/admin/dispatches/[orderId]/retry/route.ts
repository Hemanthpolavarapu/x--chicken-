import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  OrderDispatchDocument,
  OrderDocument,
  PHASE3_COLLECTIONS,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { expireStaleOffers, startOrAdvanceDispatch } from "@/modules/dispatch/engine";
import { toOrderDTO } from "@/modules/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    assertTrustedOrigin(request);
    await requireRole(request, "ADMIN", [USER_ROLES.ADMIN]);

    const { orderId } = await context.params;
    if (!ObjectId.isValid(orderId)) {
      throw new ApiError("BAD_REQUEST", "Invalid order ID.", 400);
    }

    await expireStaleOffers();
    const oid = new ObjectId(orderId);
    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const dispatchCol = await getCollection<OrderDispatchDocument>(
      PHASE3_COLLECTIONS.ORDER_DISPATCHES
    );

    const order = await ordersCol.findOne({ _id: oid });
    if (!order) {
      throw new ApiError("NOT_FOUND", "Order not found.", 404);
    }
    if (order.status === "ASSIGNED" || order.status === "DELIVERED" || order.status === "CANCELLED") {
      throw new ApiError("CONFLICT", `Order is already ${order.status}.`, 409);
    }

    const now = new Date();
    await dispatchCol.updateOne(
      { orderId: oid },
      {
        $set: {
          status: "SEARCHING",
          attemptedVendorIds: [],
          updatedAt: now,
        },
        $unset: { currentOfferId: "", currentVendorId: "", currentStoreId: "", offerExpiresAt: "", failureReason: "" },
      }
    );
    await ordersCol.updateOne(
      { _id: oid },
      { $set: { status: "SEARCHING", dispatchStatus: "SEARCHING", updatedAt: now } }
    );

    await startOrAdvanceDispatch(oid);
    const updated = await ordersCol.findOne({ _id: oid });
    return applyCorsHeaders(request, apiSuccess({ order: toOrderDTO(updated ?? order) }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
