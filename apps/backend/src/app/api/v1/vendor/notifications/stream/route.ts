import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import { NotificationDocument, PHASE3_COLLECTIONS } from "@/database/phase3Collections";
import { handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
import { expireStaleOffers } from "@/modules/dispatch/engine";
import { toNotificationDTO } from "@/modules/notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const url = new URL(request.url);
    const lastEventId =
      request.headers.get("last-event-id") || url.searchParams.get("lastEventId");
    const sinceParam = url.searchParams.get("since");

    let lastSeenId =
      lastEventId && ObjectId.isValid(lastEventId) ? new ObjectId(lastEventId) : null;
    const sinceDate = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 5000);

    const encoder = new TextEncoder();
    const col = await getCollection<NotificationDocument>(PHASE3_COLLECTIONS.NOTIFICATIONS);

    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown, id?: string) => {
          if (closed) return;
          const lines = [];
          if (id) lines.push(`id: ${id}`);
          lines.push(`event: ${event}`);
          lines.push(`data: ${JSON.stringify(data)}`);
          controller.enqueue(encoder.encode(lines.join("\n") + "\n\n"));
        };

        sendEvent("connected", { ok: true, timestamp: new Date().toISOString() });

        const poll = async () => {
          if (closed) return;
          try {
            await expireStaleOffers();
            const query: Record<string, unknown> = {
              recipientId: auth.user._id!,
              recipientRole: USER_ROLES.VENDOR,
            };
            if (lastSeenId) {
              query._id = { $gt: lastSeenId };
            } else {
              query.createdAt = { $gte: sinceDate };
            }
            const docs = await col.find(query).sort({ _id: 1 }).limit(20).toArray();
            for (const doc of docs) {
              lastSeenId = doc._id!;
              sendEvent("notification", toNotificationDTO(doc), doc._id!.toHexString());
            }
          } catch {
            // Keep SSE alive across transient DB hiccups
          }
        };

        await poll();
        const pollTimer = setInterval(poll, 2000);
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
