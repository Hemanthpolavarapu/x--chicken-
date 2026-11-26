import { updateVendorInventorySchema, USER_ROLES } from "@x-chicken/shared";
import { getCollection } from "@/database/client";
import {
  InventoryDocument,
  PHASE3_COLLECTIONS,
  ProductDocument,
} from "@/database/phase3Collections";
import { ApiError, apiSuccess, handleApiError } from "@/lib/apiResponse";
import { requireRole } from "@/middleware/auth";
import { applyCorsHeaders, assertTrustedOrigin, handleCorsPreflight } from "@/middleware/cors";
import { ensureCanonicalProductsSeeded } from "@/modules/catalog/productsCatalog";
import { getVendorAndStoreByUserId, initializeStoreInventory } from "@/modules/vendor/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return handleCorsPreflight(request);
}

export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    await ensureCanonicalProductsSeeded();
    const productsCol = await getCollection<ProductDocument>(PHASE3_COLLECTIONS.PRODUCTS);
    const invCol = await getCollection<InventoryDocument>(PHASE3_COLLECTIONS.INVENTORY);

    let invDocs = await invCol.find({ storeId: data.store._id! }).toArray();
    if (invDocs.length === 0) {
      await initializeStoreInventory(data.vendor._id!, data.store._id!);
      invDocs = await invCol.find({ storeId: data.store._id! }).toArray();
    }

    const products = await productsCol.find({ isActive: true }).toArray();
    const productMap = new Map(products.map((p) => [p.productId, p]));

    const items = invDocs.map((inv) => {
      const prod = productMap.get(inv.productId);
      const variant = prod?.variants.find((v) => v.id === inv.variantId);
      return {
        id: inv._id!.toHexString(),
        productId: inv.productId,
        variantId: inv.variantId,
        productName: prod?.name ?? inv.productId,
        category: prod?.category ?? "general",
        variantLabel: variant?.label ?? inv.variantId,
        basePrice: variant?.price ?? prod?.basePrice ?? 0,
        priceOverride: inv.priceOverride,
        stockQty: inv.stockQty,
        reservedQty: inv.reservedQty,
        isAvailable: inv.isAvailable,
        updatedAt: inv.updatedAt.toISOString(),
      };
    });

    return applyCorsHeaders(request, apiSuccess({ items }));
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}

export async function PATCH(request: Request) {
  try {
    assertTrustedOrigin(request);
    const auth = await requireRole(request, "VENDOR", [USER_ROLES.VENDOR]);
    const data = await getVendorAndStoreByUserId(auth.user._id!);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Vendor store not found.", 404);
    }

    const body = await request.json();
    const parsed = updateVendorInventorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid inventory update", 400, parsed.error.flatten());
    }

    const input = parsed.data;
    const invCol = await getCollection<InventoryDocument>(PHASE3_COLLECTIONS.INVENTORY);
    const now = new Date();

    const updated = await invCol.findOneAndUpdate(
      {
        storeId: data.store._id!,
        productId: input.productId,
        variantId: input.variantId,
      },
      {
        $set: {
          vendorId: data.vendor._id!,
          stockQty: input.stockQty,
          isAvailable: input.isAvailable && input.stockQty > 0,
          ...(input.priceOverride !== undefined ? { priceOverride: input.priceOverride } : {}),
          updatedAt: now,
        },
        $setOnInsert: {
          reservedQty: 0,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return applyCorsHeaders(
      request,
      apiSuccess({
        item: {
          id: updated!._id!.toHexString(),
          productId: updated!.productId,
          variantId: updated!.variantId,
          stockQty: updated!.stockQty,
          isAvailable: updated!.isAvailable,
          priceOverride: updated!.priceOverride,
          updatedAt: updated!.updatedAt.toISOString(),
        },
      })
    );
  } catch (error) {
    return applyCorsHeaders(request, handleApiError(error));
  }
}
