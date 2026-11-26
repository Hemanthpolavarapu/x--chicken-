import { ObjectId } from "mongodb";
import type { NotificationDTO, UserRole } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  NotificationDocument,
  OrderEventDocument,
  PHASE3_COLLECTIONS,
} from "@/database/phase3Collections";

export function toNotificationDTO(doc: NotificationDocument): NotificationDTO {
  return {
    id: doc._id!.toHexString(),
    recipientId: doc.recipientId.toHexString(),
    recipientRole: doc.recipientRole,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    orderId: doc.orderId?.toHexString(),
    offerId: doc.offerId?.toHexString(),
    isRead: doc.isRead,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createNotification(input: {
  recipientId: ObjectId;
  recipientRole: UserRole;
  type: string;
  title: string;
  message: string;
  orderId?: ObjectId;
  offerId?: ObjectId;
}): Promise<NotificationDocument> {
  const col = await getCollection<NotificationDocument>(PHASE3_COLLECTIONS.NOTIFICATIONS);
  const doc: NotificationDocument = {
    recipientId: input.recipientId,
    recipientRole: input.recipientRole,
    type: input.type,
    title: input.title,
    message: input.message,
    orderId: input.orderId,
    offerId: input.offerId,
    isRead: false,
    createdAt: new Date(),
  };
  const res = await col.insertOne(doc);
  doc._id = res.insertedId;
  return doc;
}

export async function recordOrderEvent(input: {
  orderId: ObjectId;
  actorId?: ObjectId;
  actorRole: UserRole | "SYSTEM";
  eventType: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const col = await getCollection<OrderEventDocument>(PHASE3_COLLECTIONS.ORDER_EVENTS);
  await col.insertOne({
    orderId: input.orderId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    eventType: input.eventType,
    message: input.message,
    metadata: input.metadata,
    createdAt: new Date(),
  });
}
