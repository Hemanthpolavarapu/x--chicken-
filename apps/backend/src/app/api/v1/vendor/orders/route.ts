import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  OrderDocument,
  PHASE3_COLLECTIONS,
  VendorOrderOfferDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
import { expireStaleOffers, toVendorOfferDTO } from "@/modules/dispatch/engine";
import { toVendorOrderDTO } from "@/modules/orders/service";
import { getVendorAndStoreByUserId } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    await expireStaleOffers();

    const offersCol = await getCollection<VendorOrderOfferDocument>(
      PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS
    );
    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);

    const now = new Date();
    const pendingOffers = await offersCol
      .find({
        vendorId: data.vendor._id!,
        status: "OFFERED",
        expiresAt: { $gt: now },
      })
      .sort({ offeredAt: -1 })
      .toArray();

    const offerOrderIds = pendingOffers.map((o) => o.orderId);
    const offerOrders =
      offerOrderIds.length > 0
        ? await ordersCol.find({ _id: { $in: offerOrderIds } }).toArray()
        : [];
    const offerOrderMap = new Map(offerOrders.map((o) => [o._id!.toHexString(), o]));

    const incomingOffers = pendingOffers
      .map((offer) => {
        const ord = offerOrderMap.get(offer.orderId.toHexString());
        return ord ? toVendorOfferDTO(offer, ord) : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const assignedOrders = await ordersCol
      .find({ vendorId: data.vendor._id! })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const activeStatuses = new Set([
      "ASSIGNED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
    ]);

    const activeOrders = assignedOrders
      .filter((o) => activeStatuses.has(o.status))
      .map(toVendorOrderDTO);
    const completedOrders = assignedOrders
      .filter((o) => o.status === "DELIVERED" || o.status === "CANCELLED")
      .map(toVendorOrderDTO);

    const deliveredRevenue = assignedOrders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return applyCorsHeaders(
      request,
      apiSuccess({
        incomingOffers,
        activeOrders,
        completedOrders,
        metrics: {
          incomingCount: incomingOffers.length,
          activeCount: activeOrders.length,
          deliveredCount: assignedOrders.filter((o) => o.status === "DELIVERED").length,
          totalRevenue: deliveredRevenue,
        },
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
