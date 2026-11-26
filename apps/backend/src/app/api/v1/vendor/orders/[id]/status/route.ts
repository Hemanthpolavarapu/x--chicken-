import { ObjectId } from "mongodb";
import { OrderStatus, USER_ROLES, vendorOrderStatusSchema } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { OrderDocument, PHASE3_COLLECTIONS, StoreDocument } from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { createNotification, recordOrderEvent } from "@/modules/notifications/service";
import { toVendorOrderDTO } from "@/modules/orders/service";
import { getVendorAndStoreByUserId } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  ASSIGNED: ["PREPARING"],
  PREPARING: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      throw new ApiError("BAD_REQUEST", "Invalid order ID.", 400);
    }

    const body = await request.json();
    const parsed = vendorOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid status update", 400, parsed.error.flatten());
    }

    const nextStatus = parsed.data.status;
    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const storesCol = await getCollection<StoreDocument>(PHASE3_COLLECTIONS.STORES);
    const existing = await ordersCol.findOne({
      _id: new ObjectId(id),
      vendorId: data.vendor._id!,
    });

    if (!existing) {
      throw new ApiError("NOT_FOUND", "Order not found for your store.", 404);
    }

    const allowedNext = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowedNext.includes(nextStatus)) {
      throw new ApiError(
        "CONFLICT",
        `Cannot transition order from ${existing.status} to ${nextStatus}.`,
        409
      );
    }

    const now = new Date();
    const updated = await ordersCol.findOneAndUpdate(
      { _id: existing._id!, vendorId: data.vendor._id!, status: existing.status },
      { $set: { status: nextStatus, updatedAt: now } },
      { returnDocument: "after" }
    );

    if (!updated) {
      throw new ApiError("CONFLICT", "Order status changed concurrently.", 409);
    }

    if (nextStatus === "DELIVERED") {
      await storesCol.updateOne(
        { _id: data.store._id!, activeOrderCount: { $gt: 0 } },
        { $inc: { activeOrderCount: -1 }, $set: { updatedAt: now } }
      );
    }

    await Promise.all([
      recordOrderEvent({
        orderId: existing._id!,
        actorId: auth.user._id!,
        actorRole: "VENDOR",
        eventType: `ORDER_${nextStatus}`,
        message: parsed.data.note || `Order status updated to ${nextStatus}.`,
      }),
      createNotification({
        recipientId: existing.customerId,
        recipientRole: "CUSTOMER",
        type: `ORDER_${nextStatus}`,
        title: `Order ${existing.orderNumber}: ${nextStatus.replace(/_/g, " ")}`,
        message: `${data.store.storeName} updated your order status to ${nextStatus.replace(/_/g, " ")}.`,
        orderId: existing._id!,
      }),
    ]);

    return applyCorsHeaders(request, apiSuccess({ order: toVendorOrderDTO(updated) }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
