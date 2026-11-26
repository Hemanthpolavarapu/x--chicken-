import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  PHASE3_COLLECTIONS,
  StoreDocument,
  VendorDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPRESS_15_MIN_MAX_KM = 3.0;

interface EligibleStoreCandidate extends StoreDocument {
  distanceMeters: number;
  vendorDoc: VendorDocument;
}

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ApiError("BAD_REQUEST", "Valid lat and lng query parameters are required.", 400);
    }

    const db = await getDatabase();
    await ensurePhase3Indexes(db);
    const storesCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);

    const candidates = await storesCol
      .aggregate<EligibleStoreCandidate>([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] },
            distanceField: "distanceMeters",
            spherical: true,
            maxDistance: 50000,
            query: {
              isOnline: true,
              isOpen: true,
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
        { $sort: { distanceMeters: 1, activeOrderCount: 1, _id: 1 } },
        { $limit: 1 },
      ])
      .toArray();

    if (candidates.length === 0) {
      return applyCorsHeaders(
        request,
        apiSuccess({
          eligible: false,
          express15MinEligible: false,
          nearestDistanceKm: null,
          nearestStoreName: null,
          estimatedMins: null,
        })
      );
    }

    const nearest = candidates[0];
    const distanceKm = Number((nearest.distanceMeters / 1000).toFixed(2));
    const express15MinEligible = distanceKm <= EXPRESS_15_MIN_MAX_KM;
    const estimatedMins = express15MinEligible
      ? Math.max(10, Math.min(15, Math.round(10 + distanceKm * 1.5)))
      : Math.max(20, Math.round(18 + distanceKm * 2.5));

    return applyCorsHeaders(
      request,
      apiSuccess({
        eligible: true,
        express15MinEligible,
        nearestDistanceKm: distanceKm,
        nearestStoreName: nearest.storeName,
        estimatedMins,
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
