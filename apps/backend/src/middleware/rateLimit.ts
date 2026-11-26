import { getCollection } from "@/database/client";
import { COLLECTIONS, RateLimitDocument } from "@/database/collections";
import { ApiError } from "@/lib/apiResponse";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * MongoDB-backed fixed-window rate limiter safe for serverless Vercel functions.
 */
export async function enforceRateLimit(
  bucket: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<void> {
  const col = await getCollection<RateLimitDocument>(COLLECTIONS.RATE_LIMITS);
  const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `${bucket}:${identifier}:${windowBucket}`;
  const expiresAt = new Date((windowBucket + 1) * windowSeconds * 1000 + 5_000);

  const result = await col.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt },
    },
    { upsert: true, returnDocument: "after" }
  );

  if (result && result.count > maxRequests) {
    throw new ApiError(
      "TOO_MANY_REQUESTS",
      "Too many attempts. Please wait a few minutes and try again.",
      429
    );
  }
}
