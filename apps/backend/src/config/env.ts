import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z
    .string()
    .trim()
    .min(1, "MONGODB_URI is required")
    .refine(
      (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
      "MONGODB_URI must start with mongodb:// or mongodb+srv://"
    ),
  MONGODB_DB_NAME: z
    .string()
    .trim()
    .min(1, "MONGODB_DB_NAME cannot be empty")
    .default("x_chicken"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_DNS_FALLBACK: z.enum(["true", "false"]).optional(),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,https://x-chicken.vercel.app"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

function assertServerSide() {
  if (typeof window !== "undefined") {
    throw new Error("Server environment configuration cannot be accessed in browser code.");
  }
}

export function isMongoConfigured(): boolean {
  assertServerSide();
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export function getAllowedOrigins(): string[] {
  assertServerSide();
  const raw =
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:3000,https://x-chicken.vercel.app";
  return raw
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function getServerEnv(): ServerEnv {
  assertServerSide();
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "x_chicken",
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_DNS_FALLBACK: process.env.MONGODB_DNS_FALLBACK,
    ALLOWED_ORIGINS:
      process.env.ALLOWED_ORIGINS ||
      "http://localhost:3000,https://x-chicken.vercel.app",
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration: ${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
