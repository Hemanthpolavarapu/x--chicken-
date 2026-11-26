import { USER_ROLES } from "@x-chicken/shared";
import { getDatabase } from "@/database/client";
import {
  ensurePhase3Indexes,
  PHASE3_COLLECTIONS,
  StoreDocument,
  VendorDocument,
} from "@/database/phase3Collections";
import { apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, handleCorsPreflight } from "@/middleware/cors";
import { toStoreDTO, toVendorDTO } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    await requireRole(request, "ADMIN", [USER_ROLES.ADMIN]);
    const db = await getDatabase();
    await ensurePhase3Indexes(db);

    const vendorsCol = db.collection<VendorDocument>(PHASE3_COLLECTIONS.VENDORS);
    const storesCol = db.collection<StoreDocument>(PHASE3_COLLECTIONS.STORES);

    const vendors = await vendorsCol.find({}).sort({ createdAt: -1 }).limit(100).toArray();
    const stores = await storesCol
      .find({ vendorId: { $in: vendors.map((v) => v._id!) } })
      .toArray();

    const storeByVendor = new Map(stores.map((s) => [s.vendorId.toHexString(), s]));

    const results = vendors.map((v) => {
      const store = storeByVendor.get(v._id!.toHexString());
      return {
        vendor: toVendorDTO(v),
        store: store ? toStoreDTO(store) : null,
      };
    });

    return applyCorsHeaders(request, apiSuccess({ vendors: results }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
