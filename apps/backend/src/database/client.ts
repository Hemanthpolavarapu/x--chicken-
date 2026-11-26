import dns from "node:dns";
import { MongoClient, Db, Collection, Document, MongoClientOptions } from "mongodb";
import { getServerEnv, isMongoConfigured } from "@/config/env";
import { ensureAuthIndexes } from "@/database/collections";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _authIndexesEnsured: boolean | undefined;
}

const CLIENT_OPTIONS: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 60_000,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 30_000,
};

function assertServerSide() {
  if (typeof window !== "undefined") {
    throw new Error("MongoDB client cannot be initialized in browser code.");
  }
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(/\/\/[^@]+@/g, "//***:***@");
}

function isDnsFallbackAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.MONGODB_DNS_FALLBACK === "true"
  );
}

function ensureSrvDnsResolution(uri: string) {
  if (!uri.startsWith("mongodb+srv://") || !isDnsFallbackAllowed()) return;
  try {
    const servers = dns.getServers();
    const onlyLoopback =
      servers.length === 0 ||
      servers.every((s) => s === "127.0.0.1" || s === "::1");
    if (onlyLoopback) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }
  } catch {
    // Non-fatal
  }
}

async function connectWithDnsFallback(uri: string): Promise<MongoClient> {
  ensureSrvDnsResolution(uri);
  const client = new MongoClient(uri, CLIENT_OPTIONS);
  try {
    return await client.connect();
  } catch (err) {
    const e = err as { code?: string; message?: string };
    const isSrvRefused =
      uri.startsWith("mongodb+srv://") &&
      (e?.code === "ECONNREFUSED" || String(e?.message || "").includes("querySrv"));

    if (isSrvRefused && isDnsFallbackAllowed()) {
      await client.close().catch(() => {});
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      const retryClient = new MongoClient(uri, CLIENT_OPTIONS);
      return await retryClient.connect();
    }
    await client.close().catch(() => {});
    throw err;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  assertServerSide();

  if (globalThis._mongoClientPromise) {
    return globalThis._mongoClientPromise;
  }

  const { MONGODB_URI } = getServerEnv();
  const promise = connectWithDnsFallback(MONGODB_URI).catch((err) => {
    globalThis._mongoClientPromise = undefined;
    const e = err as { name?: string; code?: string | number; codeName?: string; message?: string };
    console.error("[MongoDB] Connection failed:", {
      name: e?.name,
      code: e?.code,
      codeName: e?.codeName,
      message: e?.message ? sanitizeErrorMessage(String(e.message)) : "Unknown error",
    });
    throw err;
  });

  globalThis._mongoClientPromise = promise;
  return promise;
}

export async function getDatabase(): Promise<Db> {
  const { MONGODB_DB_NAME } = getServerEnv();
  const client = await getMongoClient();
  const db = client.db(MONGODB_DB_NAME);

  if (!globalThis._authIndexesEnsured) {
    globalThis._authIndexesEnsured = true;
    await ensureAuthIndexes(db).catch((err) => {
      globalThis._authIndexesEnsured = false;
      console.error("[MongoDB] Failed ensuring auth indexes:", err);
    });
  }

  return db;
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(name);
}

export async function pingDatabase(): Promise<
  | { configured: false }
  | { configured: true; connected: true; latencyMs: number }
  | { configured: true; connected: false }
> {
  assertServerSide();
  if (!isMongoConfigured()) {
    return { configured: false };
  }

  const start = Date.now();
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return {
      configured: true,
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    const e = err as { name?: string; code?: string | number; codeName?: string; message?: string };
    console.error("[MongoDB] Health ping failed:", {
      name: e?.name,
      code: e?.code,
      codeName: e?.codeName,
      message: e?.message ? sanitizeErrorMessage(String(e.message)) : "Unknown error",
    });
    return {
      configured: true,
      connected: false,
    };
  }
}
