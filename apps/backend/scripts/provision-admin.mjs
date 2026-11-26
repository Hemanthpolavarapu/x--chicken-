import dns from "node:dns";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

// Load backend .env.local if present
try {
  process.loadEnvFile(".env.local");
} catch {
  // Ignore if env vars are supplied directly by shell
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "x_chicken";
const email = (process.env.ADMIN_PROVISION_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PROVISION_PASSWORD || "";
const name = (process.env.ADMIN_PROVISION_NAME || "X-Chicken Admin").trim();

if (!uri || !email || !password) {
  console.error(
    "Missing required env vars: MONGODB_URI, ADMIN_PROVISION_EMAIL, ADMIN_PROVISION_PASSWORD"
  );
  process.exit(1);
}

if (password.length < 10) {
  console.error("ADMIN_PROVISION_PASSWORD must be at least 10 characters.");
  process.exit(1);
}

if (uri.startsWith("mongodb+srv://") && process.env.NODE_ENV !== "production") {
  const servers = dns.getServers();
  if (servers.length === 0 || servers.every((s) => s === "127.0.0.1" || s === "::1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await client.connect();
const db = client.db(dbName);
const users = db.collection("users");
await users.createIndex({ email: 1 }, { unique: true, name: "uniq_user_email" });

const passwordHash = await bcrypt.hash(password, 12);
const now = new Date();

await users.updateOne(
  { email },
  {
    $set: {
      name,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: now,
    },
    $setOnInsert: {
      email,
      createdAt: now,
    },
  },
  { upsert: true }
);

console.log(`Provisioned ADMIN account for ${email} in database "${dbName}".`);
await client.close();
