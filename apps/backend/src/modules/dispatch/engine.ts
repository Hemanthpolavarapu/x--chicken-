import { ObjectId } from "mongodb";
import type { VendorOfferDTO } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  InventoryDocument,
  OrderDispatchDocument,
  OrderDocument,
  PHASE3_COLLECTIONS,
  StoreDocument,
  VendorDocument,
  VendorOrderOfferDocument,
} from "@/database/phase3Collections";
import { ApiError } from "@/lib/apiResponse";
import { createNotification, recordOrderEvent } from "@/modules/notifications/service";

interface CandidateStoreResult extends StoreDocument {
  distanceMeters: number;
  vendorDoc: VendorDocument;
}

export function toVendorOfferDTO(
  offer: VendorOrderOfferDocument,
  order: OrderDocument
): VendorOfferDTO {
  return {
    id: offer._id!.toHexString(),
    orderId: offer.orderId.toHexString(),
    orderNumber: offer.orderNumber,
    vendorId: offer.vendorId.toHexString(),
    storeId: offer.storeId.toHexString(),
    status: offer.status,
    attemptNumber: offer.attemptNumber,
    distanceKm: Number(offer.distanceKm.toFixed(2)),
    offeredAt: offer.offeredAt.toISOString(),
    expiresAt: offer.expiresAt.toISOString(),
    respondedAt: offer.respondedAt?.toISOString(),
    rejectionReason: offer.rejectionReason,
    orderSummary: {
      items: order.items,
      totalAmount: order.totalAmount,
    },
  };
}

async function storeHasInventoryForOrder(
  storeId: ObjectId,
  order: OrderDocument
): Promise<boolean> {
  const db = await getDatabase();
  const invCol = db.collection<InventoryDocument>(PHASE3_COLLECTIONS.INVENTORY);
  const invDocs = await invCol
    .find({
      storeId,
      productId: { $in: order.items.map((i) => i.productId) },
    })
    .toArray();

  for (const item of order.items) {
    const match = invDocs.find(
      (d) => d.productId === item.productId && d.variantId === item.variantId
    );
    if (!match || !match.isAvailable || match.stockQty - match.reservedQty < item.quantity) {
      return false;
    }
  }
  return true;
}

export async function findNextEligibleVendor(
  order: OrderDocument,
  attemptedVendorIds: ObjectId[]
): Promise<{ vendor: VendorDocument; store: StoreDocument; distanceKm: number } | null> {
  const db = await getDatabase();
  await ensurePhase3Indexes(db);
  const storesCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);

  const candidates = await storesCol
    .aggregate<CandidateStoreResult>([
      {
        $geoNear: {
          near: order.deliveryAddress.location,
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: 50000, // 50km hard ceiling; per-store radius checked below
          query: {
            isOnline: true,
            isOpen: true,
            vendorId: { $nin: attemptedVendorIds },
            $expr: { $lt: ["$activeOrderCount", "$maxConcurrentOrders"] },
          },
        },
      },
      {
        $lookup: {
          from: PHASE3_COLLECTIONS.VENDORS,
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorArr",
        },
      },
      { $unwind: "$vendorArr" },
      {
        $match: {
          "vendorArr.approvalStatus": "APPROVED",
          $expr: {
            $lte: ["$distanceMeters", { $multiply: ["$serviceRadiusKm", 1000] }],
          },
        },
      },
      {
        $addFields: {
          vendorDoc: "$vendorArr",
        },
      },
      {
        $sort: {
          distanceMeters: 1,
          activeOrderCount: 1,
          _id: 1,
        },
      },
      { $limit: 25 },
    ])
    .toArray();

  for (const candidate of candidates) {
    const canFulfill = await storeHasInventoryForOrder(candidate._id!, order);
    if (canFulfill) {
      return {
        vendor: candidate.vendorDoc,
        store: candidate,
        distanceKm: candidate.distanceMeters / 1000,
      };
    }
  }

  return null;
}

export async function startOrAdvanceDispatch(orderId: ObjectId): Promise<void> {
  const db = await getDatabase();
  await ensurePhase3Indexes(db);

  const ordersCol = db.collection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
  const dispatchCol = db.collection<OrderDispatchDocument>(PHASE3_COLLECTIONS.ORDER_DISPATCHES);
  const offersCol = db.collection<VendorOrderOfferDocument>(PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS);

  const order = await ordersCol.findOne({ _id: orderId });
  if (!order) return;
  if (
    order.status === "ASSIGNED" ||
    order.status === "DELIVERED" ||
    order.status === "CANCELLED"
  ) {
    return;
  }

  const now = new Date();
  let dispatch: (OrderDispatchDocument & { _id: ObjectId }) | null =
    await dispatchCol.findOne({ orderId });
  if (!dispatch) {
    const newDispatch: OrderDispatchDocument & { _id: ObjectId } = {
      _id: new ObjectId(),
      orderId,
      orderNumber: order.orderNumber,
      status: "SEARCHING",
      attemptCount: 0,
      attemptedVendorIds: [],
      createdAt: now,
      updatedAt: now,
    };
    await dispatchCol.insertOne(newDispatch);
    dispatch = newDispatch;
  }

  if (dispatch.status === "ASSIGNED" || dispatch.status === "CANCELLED") {
    return;
  }

  // If there is already an active unexpired OFFERED offer, don't double-offer
  if (
    dispatch.status === "OFFERED" &&
    dispatch.currentOfferId &&
    dispatch.offerExpiresAt &&
    dispatch.offerExpiresAt > now
  ) {
    return;
  }

  const next = await findNextEligibleVendor(order, dispatch.attemptedVendorIds);

  if (!next) {
    await Promise.all([
      dispatchCol.updateOne(
        { _id: dispatch._id },
        {
          $set: {
            status: "NO_VENDOR_AVAILABLE",
            failureReason: "No eligible nearby vendors available",
            updatedAt: now,
          },
          $unset: { currentOfferId: "", currentVendorId: "", currentStoreId: "", offerExpiresAt: "" },
        }
      ),
      ordersCol.updateOne(
        { _id: orderId, status: { $in: ["PENDING", "SEARCHING", "OFFERED"] } },
        {
          $set: {
            status: "NO_VENDOR_AVAILABLE",
            dispatchStatus: "NO_VENDOR_AVAILABLE",
            updatedAt: now,
          },
        }
      ),
      recordOrderEvent({
        orderId,
        actorRole: "SYSTEM",
        eventType: "NO_VENDOR_AVAILABLE",
        message: "No eligible nearby approved vendor available to fulfill this order.",
      }),
      createNotification({
        recipientId: order.customerId,
        recipientRole: "CUSTOMER",
        type: "NO_VENDOR_AVAILABLE",
        title: "No Nearby Store Available",
        message: `Order ${order.orderNumber} could not be matched to a nearby online store right now.`,
        orderId,
      }),
    ]);
    return;
  }

  const timeoutSec = Math.max(5, next.store.autoAcceptTimeoutSec || 60);
  const expiresAt = new Date(now.getTime() + timeoutSec * 1000);
  const attemptNumber = dispatch.attemptCount + 1;
  const offerId = new ObjectId();

  const offerDoc: VendorOrderOfferDocument = {
    _id: offerId,
    orderId,
    orderNumber: order.orderNumber,
    dispatchId: dispatch._id!,
    vendorId: next.vendor._id!,
    storeId: next.store._id!,
    status: "OFFERED",
    attemptNumber,
    distanceKm: next.distanceKm,
    offeredAt: now,
    expiresAt,
  };

  await offersCol.insertOne(offerDoc);

  await Promise.all([
    dispatchCol.updateOne(
      { _id: dispatch._id },
      {
        $set: {
          status: "OFFERED",
          attemptCount: attemptNumber,
          currentOfferId: offerId,
          currentVendorId: next.vendor._id!,
          currentStoreId: next.store._id!,
          offerExpiresAt: expiresAt,
          updatedAt: now,
        },
        $addToSet: { attemptedVendorIds: next.vendor._id! },
      }
    ),
    ordersCol.updateOne(
      { _id: orderId, status: { $in: ["PENDING", "SEARCHING", "OFFERED"] } },
      {
        $set: {
          status: "OFFERED",
          dispatchStatus: "OFFERED",
          updatedAt: now,
        },
      }
    ),
    recordOrderEvent({
      orderId,
      actorRole: "SYSTEM",
      eventType: "OFFER_SENT",
      message: `Offered order to ${next.store.storeName} (${next.distanceKm.toFixed(2)} km away, attempt #${attemptNumber}).`,
      metadata: {
        vendorId: next.vendor._id!.toHexString(),
        storeId: next.store._id!.toHexString(),
        distanceKm: Number(next.distanceKm.toFixed(2)),
        attemptNumber,
      },
    }),
    createNotification({
      recipientId: next.vendor.userId,
      recipientRole: "VENDOR",
      type: "NEW_ORDER_OFFER",
      title: `New Order Offer ${order.orderNumber}`,
      message: `₹${order.totalAmount} • ${order.items.length} item(s) • ${next.distanceKm.toFixed(1)} km away`,
      orderId,
      offerId,
    }),
  ]);
}

export async function expireStaleOffers(): Promise<number> {
  const db = await getDatabase();
  await ensurePhase3Indexes(db);
  const offersCol = db.collection<VendorOrderOfferDocument>(PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS);
  const vendorsCol = db.collection<VendorDocument>(PHASE3_COLLECTIONS.VENDORS);

  const now = new Date();
  const stale = await offersCol
    .find({ status: "OFFERED", expiresAt: { $lte: now } })
    .limit(50)
    .toArray();

  let expiredCount = 0;
  for (const offer of stale) {
    const updated = await offersCol.findOneAndUpdate(
      { _id: offer._id, status: "OFFERED", expiresAt: { $lte: now } },
      { $set: { status: "EXPIRED", respondedAt: now } },
      { returnDocument: "after" }
    );
    if (!updated) continue;
    expiredCount += 1;

    const vendor = await vendorsCol.findOne({ _id: offer.vendorId });
    const dispatchCol = db.collection<OrderDispatchDocument>(PHASE3_COLLECTIONS.ORDER_DISPATCHES);
    await Promise.all([
      dispatchCol.updateOne(
        { orderId: offer.orderId, currentOfferId: offer._id },
        {
          $set: { status: "SEARCHING", updatedAt: now },
          $unset: { currentOfferId: "", currentVendorId: "", currentStoreId: "", offerExpiresAt: "" },
        }
      ),
      recordOrderEvent({
        orderId: offer.orderId,
        actorRole: "SYSTEM",
        eventType: "OFFER_EXPIRED",
        message: `Offer #${offer.attemptNumber} timed out without vendor response.`,
        metadata: { vendorId: offer.vendorId.toHexString() },
      }),
      vendor
        ? createNotification({
            recipientId: vendor.userId,
            recipientRole: "VENDOR",
            type: "OFFER_EXPIRED",
            title: `Offer Expired (${offer.orderNumber})`,
            message: "You missed an incoming order offer because it timed out.",
            orderId: offer.orderId,
            offerId: offer._id,
          })
        : Promise.resolve(),
    ]);

    await startOrAdvanceDispatch(offer.orderId);
  }

  return expiredCount;
}

export async function acceptVendorOffer(input: {
  offerId: ObjectId;
  vendor: VendorDocument;
  store: StoreDocument;
}): Promise<OrderDocument> {
  await expireStaleOffers();
  const db = await getDatabase();
  const offersCol = db.collection<VendorOrderOfferDocument>(PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS);
  const ordersCol = db.collection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
  const dispatchCol = db.collection<OrderDispatchDocument>(PHASE3_COLLECTIONS.ORDER_DISPATCHES);
  const storesCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);
  const invCol = db.collection<InventoryDocument>(PHASE3_COLLECTIONS.INVENTORY);

  if (input.vendor.approvalStatus !== "APPROVED") {
    throw new ApiError("FORBIDDEN", "Your store must be approved before accepting orders.", 403);
  }

  const now = new Date();
  const claimedOffer = await offersCol.findOneAndUpdate(
    {
      _id: input.offerId,
      vendorId: input.vendor._id!,
      status: "OFFERED",
      expiresAt: { $gt: now },
    },
    { $set: { status: "ACCEPTED", respondedAt: now } },
    { returnDocument: "after" }
  );

  if (!claimedOffer) {
    throw new ApiError("CONFLICT", "This order offer has already expired, been rejected, or been claimed.", 409);
  }

  // Reserve store capacity atomically
  const updatedStore = await storesCol.findOneAndUpdate(
    {
      _id: input.store._id!,
      $expr: { $lt: ["$activeOrderCount", "$maxConcurrentOrders"] },
    },
    { $inc: { activeOrderCount: 1 }, $set: { updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!updatedStore) {
    await offersCol.updateOne(
      { _id: claimedOffer._id },
      { $set: { status: "REJECTED", rejectionReason: "Store at maximum concurrent capacity" } }
    );
    await startOrAdvanceDispatch(claimedOffer.orderId);
    throw new ApiError("CONFLICT", "Your store is currently at maximum concurrent order capacity.", 409);
  }

  const assignedOrder = await ordersCol.findOneAndUpdate(
    {
      _id: claimedOffer.orderId,
      status: { $in: ["OFFERED", "SEARCHING"] },
      vendorId: { $exists: false },
    },
    {
      $set: {
        status: "ASSIGNED",
        dispatchStatus: "ASSIGNED",
        vendorId: input.vendor._id!,
        storeId: input.store._id!,
        storeName: input.store.storeName,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!assignedOrder) {
    await storesCol.updateOne(
      { _id: input.store._id!, activeOrderCount: { $gt: 0 } },
      { $inc: { activeOrderCount: -1 } }
    );
    throw new ApiError("CONFLICT", "Order has already been assigned or cancelled.", 409);
  }

  // Deduct inventory atomically per item
  for (const item of assignedOrder.items) {
    await invCol.updateOne(
      {
        storeId: input.store._id!,
        productId: item.productId,
        variantId: item.variantId,
        stockQty: { $gte: item.quantity },
      },
      { $inc: { stockQty: -item.quantity }, $set: { updatedAt: now } }
    );
  }

  await Promise.all([
    dispatchCol.updateOne(
      { orderId: assignedOrder._id! },
      {
        $set: {
          status: "ASSIGNED",
          assignedVendorId: input.vendor._id!,
          assignedStoreId: input.store._id!,
          updatedAt: now,
        },
        $unset: { offerExpiresAt: "" },
      }
    ),
    recordOrderEvent({
      orderId: assignedOrder._id!,
      actorId: input.vendor.userId,
      actorRole: "VENDOR",
      eventType: "OFFER_ACCEPTED",
      message: `Order accepted by ${input.store.storeName}.`,
    }),
    createNotification({
      recipientId: assignedOrder.customerId,
      recipientRole: "CUSTOMER",
      type: "ORDER_ASSIGNED",
      title: `Order ${assignedOrder.orderNumber} Confirmed!`,
      message: `${input.store.storeName} has accepted your order and will begin fresh preparation.`,
      orderId: assignedOrder._id!,
    }),
  ]);

  return assignedOrder;
}

export async function rejectVendorOffer(input: {
  offerId: ObjectId;
  vendor: VendorDocument;
  store: StoreDocument;
  reason: string;
}): Promise<void> {
  const db = await getDatabase();
  const offersCol = db.collection<VendorOrderOfferDocument>(PHASE3_COLLECTIONS.VENDOR_ORDER_OFFERS);
  const now = new Date();

  const rejected = await offersCol.findOneAndUpdate(
    {
      _id: input.offerId,
      vendorId: input.vendor._id!,
      status: "OFFERED",
    },
    {
      $set: {
        status: "REJECTED",
        respondedAt: now,
        rejectionReason: input.reason,
      },
    },
    { returnDocument: "after" }
  );

  if (!rejected) {
    throw new ApiError("CONFLICT", "Offer is no longer pending.", 409);
  }

  const dispatchCol = db.collection<OrderDispatchDocument>(PHASE3_COLLECTIONS.ORDER_DISPATCHES);
  await Promise.all([
    dispatchCol.updateOne(
      { orderId: rejected.orderId, currentOfferId: rejected._id },
      {
        $set: { status: "SEARCHING", updatedAt: now },
        $unset: { currentOfferId: "", currentVendorId: "", currentStoreId: "", offerExpiresAt: "" },
      }
    ),
    recordOrderEvent({
      orderId: rejected.orderId,
      actorId: input.vendor.userId,
      actorRole: "VENDOR",
      eventType: "OFFER_REJECTED",
      message: `${input.store.storeName} declined the offer: ${input.reason}`,
    }),
  ]);

  await startOrAdvanceDispatch(rejected.orderId);
}
