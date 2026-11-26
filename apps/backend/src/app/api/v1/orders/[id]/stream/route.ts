import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { OrderDocument, PHASE3_COLLECTIONS } from "@/database/phase3Collections";
import { ApiError, handleApiError } from "@/lib/apiResponse";
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

    const orderId = new ObjectId(id);
    const ordersCol = await getCollection<OrderDocument>(PHASE3_COLLECTIONS.ORDERS);
    const initial = await ordersCol.findOne({ _id: orderId, customerId: auth.user._id! });
    if (!initial) {
      throw new ApiError("NOT_FOUND", "Order not found.", 404);
    }

    const encoder = new TextEncoder();
    let lastUpdatedAt = "";
    let closed = false;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          if (closed) return;
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        const pushIfChanged = async () => {
          if (closed) return;
          try {
            await expireStaleOffers();
            const doc = await ordersCol.findOne({ _id: orderId, customerId: auth.user._id! });
            if (!doc) return;
            const stamp = `${doc.status}:${doc.updatedAt.toISOString()}`;
            if (stamp !== lastUpdatedAt) {
              lastUpdatedAt = stamp;
              sendEvent("order_update", toOrderDTO(doc));
            }
          } catch {
            // ignore transient errors
          }
        };

        await pushIfChanged();
        const pollTimer = setInterval(pushIfChanged, 2000);
        const pingTimer = setInterval(() => {
          sendEvent("ping", { timestamp: new Date().toISOString() });
        }, 15000);

        request.signal.addEventListener("abort", () => {
          closed = true;
          clearInterval(pollTimer);
          clearInterval(pingTimer);
          try {
            controller.close();
          } catch {
            // already closed
          }
        });
      },
    });

    const response = new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
    return applyCorsHeaders(request, response);
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
