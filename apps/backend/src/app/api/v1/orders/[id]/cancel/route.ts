import { ObjectId } from "mongodb";
import { cancelOrderSchema, USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  OrderDispatchDocument,
  OrderDocument,
  PHASE3_COLLECTIONS,
  VendorOrderOfferDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { recordOrderEvent } from "@/modules/notifications/service";
import { toOrderDTO } from "@/modules/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError("BAD_REQUEST", "Invalid order ID.", 400);
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsed = cancelOrderSchema.safeParse(rawBody);
    const reason = parsed.success ? parsed.data.reason : "Cancelled by customer";

    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const dispatchCol = await getCollection<OrderDispatchDocument>(
      PHASE3_COLLECTIONS.ORDER_DISPATCHES
    );
    const offersCol = await getCollection<VendorOrderOfferDocument>(
      PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS
    );

    const now = new Date();
    const cancelled = await ordersCol.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        customerId: auth.user._id!,
        status: { $in: ["PENDING", "SEARCHING", "OFFERED", "NO_VENDOR_AVAILABLE"] },
      },
      {
        $set: {
          status: "CANCELLED",
          dispatchStatus: "CANCELLED",
          cancellationReason: reason,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    if (!cancelled) {
      throw new ApiError(
        "CONFLICT",
        "Order cannot be cancelled once accepted or already cancelled.",
        409
      );
    }

    await Promise.all([
      dispatchCol.updateOne(
        { orderId: cancelled._id! },
        { $set: { status: "CANCELLED", updatedAt: now }, $unset: { offerExpiresAt: "" } }
      ),
      offersCol.updateMany(
        { orderId: cancelled._id!, status: "OFFERED" },
        { $set: { status: "SUPERSEDED", respondedAt: now } }
      ),
      recordOrderEvent({
        orderId: cancelled._id!,
        actorId: auth.user._id!,
        actorRole: "CUSTOMER",
        eventType: "ORDER_CANCELLED",
        message: `Order cancelled by customer: ${reason}`,
      }),
    ]);

    return applyCorsHeaders(request, apiSuccess({ order: toOrderDTO(cancelled) }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
