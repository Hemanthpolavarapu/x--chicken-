import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  OrderDocument,
  OrderEventDocument,
  PHASE3_COLLECTIONS,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
import { expireStaleOffers } from "@/modules/dispatch/engine";
import { toOrderDTO } from "@/modules/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError("BAD_REQUEST", "Invalid order ID.", 400);
    }

    await expireStaleOffers();

    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const eventsCol = await getCollection<OrderEventDocument>(PHASE3_COLLECTIONS.ORDER_EVENTS);

    const order = await ordersCol.findOne({
      _id: new ObjectId(id),
      customerId: auth.user._id!,
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Order not found.", 404);
    }

    const events = await eventsCol
      .find({ orderId: order._id! })
      .sort({ createdAt: 1 })
      .toArray();

    return applyCorsHeaders(
      request,
      apiSuccess({
        order: toOrderDTO(order),
        events: events.map((e) => ({
          id: e._id!.toHexString(),
          eventType: e.eventType,
          message: e.message,
          actorRole: e.actorRole,
          createdAt: e.createdAt.toISOString(),
        })),
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
