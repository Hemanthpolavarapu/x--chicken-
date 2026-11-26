import dns from "node:dns";
import { MongoClient } from "mongodb";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Ignore if env vars are supplied directly
}

if (process.env.NODE_ENV === "production") {
  console.error("REFUSED: cleanup-test-orders cannot run in production.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "x_chicken";
const testVendorEmail = (process.env.TEST_VENDOR_EMAIL || "").trim().toLowerCase();

if (!uri || !testVendorEmail) {
  console.error("Missing MONGODB_URI or TEST_VENDOR_EMAIL");
  process.exit(1);
}

if (uri.startsWith("mongodb+srv://")) {
  const servers = dns.getServers();
  if (servers.length === 0 || servers.every((s) => s === "127.0.0.1" || s === "::1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(dbName);

try {
  const vendor = await db.collection("vendors").findOne({ email: testVendorEmail });
  if (!vendor) {
    console.log("Vendor Test not found; nothing to clean.");
    process.exit(0);
  }

  const offers = await db
    .collection("vendor_order_offers")
    .find({ vendorId: vendor._id })
    .toArray();
  const orderIds = Array.from(
    new Set([
      ...offers.map((o) => o.orderId),
      ...(
        await db.collection("orders").find({ vendorId: vendor._id }).toArray()
      ).map((o) => o._id),
    ])
  );

  const [delSessions, delNotifs, delOffers, delDispatches, delEvents, delOrders] =
    await Promise.all([
      db.collection("sessions").deleteMany({ userId: vendor.userId }),
      db.collection("notifications").deleteMany({ recipientId: vendor.userId }),
      db.collection("vendor_order_offers").deleteMany({ orderId: { $in: orderIds } }),
      db.collection("order_dispatches").deleteMany({ orderId: { $in: orderIds } }),
      db.collection("order_events").deleteMany({ orderId: { $in: orderIds } }),
      db.collection("orders").deleteMany({ _id: { $in: orderIds } }),
      db
        .collection("stores")
        .updateOne({ vendorId: vendor._id }, { $set: { activeOrderCount: 0 } }),
    ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        preservedVendorTest: true,
        deletedOrders: delOrders.deletedCount,
        deletedOffers: delOffers.deletedCount,
        deletedDispatches: delDispatches.deletedCount,
        deletedEvents: delEvents.deletedCount,
        deletedNotifications: delNotifs.deletedCount,
        deletedSessions: delSessions.deletedCount,
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}
