import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { createOrderSchema, USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  OrderDocument,
  PHASE3_COLLECTIONS,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { enforceRateLimit, getClientIp } from "@/middleware/rateLimit";
import { expireStaleOffers, startOrAdvanceDispatch } from "@/modules/dispatch/engine";
import { recordOrderEvent } from "@/modules/notifications/service";
import { calculateOrderPricing, toOrderDTO } from "@/modules/orders/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    await expireStaleOffers();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "10") || 10));
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    await ensurePhase3Indexes(db);
    const ordersCol = db.collection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);

    const [orders, total] = await Promise.all([
      ordersCol
        .find({ customerId: auth.user._id! })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      ordersCol.countDocuments({ customerId: auth.user._id! }),
    ]);

    return applyCorsHeaders(
      request,
      apiSuccess({
        orders: orders.map(toOrderDTO),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "CUSTOMER", [USER_ROLES.CUSTOMER]);
    const ip = getClientIp(request);
    await enforceRateLimit("order_create", `${auth.user._id!.toHexString()}:${ip}`, 20, 60);

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid order payload", 400, parsed.error.flatten());
    }

    const input = parsed.data;
    const rawIdempotencyKey =
      request.headers.get("idempotency-key")?.trim() ||
      request.headers.get("x-idempotency-key")?.trim() ||
      crypto.randomUUID();

    const idempotencyKey = `${auth.user._id!.toHexString()}:${rawIdempotencyKey}`;

    const db = await getDatabase();
    await ensurePhase3Indexes(db);
    const ordersCol = db.collection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);

    const existingOrder = await ordersCol.findOne({ idempotencyKey });
    if (existingOrder) {
      return applyCorsHeaders(
        request,
        apiSuccess({ order: toOrderDTO(existingOrder), deduplicated: true }, 200)
      );
    }

    const pricing = await calculateOrderPricing(input);
    const now = new Date();
    const orderId = new ObjectId();
    const orderNumber = `XC-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const orderDoc: OrderDocument = {
      _id: orderId,
      orderNumber,
      idempotencyKey,
      customerId: auth.user._id!,
      customerName: auth.user.name,
      customerPhone: auth.user.phone || input.deliveryAddress.phone,
      status: "SEARCHING",
      dispatchStatus: "SEARCHING",
      items: pricing.items,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      discount: pricing.discount,
      promoCode: pricing.promoCode,
      totalAmount: pricing.totalAmount,
      paymentMethod: input.paymentMethod,
      deliveryAddress: {
        label: input.deliveryAddress.label,
        recipientName: input.deliveryAddress.recipientName,
        phone: input.deliveryAddress.phone,
        addressLine: input.deliveryAddress.addressLine,
        landmark: input.deliveryAddress.landmark || undefined,
        city: input.deliveryAddress.city,
        pincode: input.deliveryAddress.pincode,
        location: {
          type: "Point",
          coordinates: [
            input.deliveryAddress.coordinates.lng,
            input.deliveryAddress.coordinates.lat,
          ],
        },
      },
      customerNotes: input.customerNotes || undefined,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await ordersCol.insertOne(orderDoc);
    } catch (err: unknown) {
      const duplicate =
        typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
      if (duplicate) {
        const dup = await ordersCol.findOne({ idempotencyKey });
        if (dup) {
          return applyCorsHeaders(
            request,
            apiSuccess({ order: toOrderDTO(dup), deduplicated: true }, 200)
          );
        }
      }
      throw err;
    }

    await recordOrderEvent({
      orderId,
      actorId: auth.user._id!,
      actorRole: "CUSTOMER",
      eventType: "ORDER_CREATED",
      message: `Order ${orderNumber} placed for ₹${pricing.totalAmount}.`,
    });

    await startOrAdvanceDispatch(orderId);
    const freshOrder = await ordersCol.findOne({ _id: orderId });

    return applyCorsHeaders(
      request,
      apiSuccess({ order: toOrderDTO(freshOrder ?? orderDoc), deduplicated: false }, 201)
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
