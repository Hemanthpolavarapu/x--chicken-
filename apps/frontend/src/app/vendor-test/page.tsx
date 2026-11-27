import { notFound } from "next/navigation";
import VendorTestClient from "./VendorTestClient";

export const dynamic = "force-dynamic";

export default function VendorTestEntryPage() {
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  const previewTestVendorEnabled =
    isVercelPreview &&
    process.env.ENABLE_DEV_TEST_VENDOR === "true";
  if (
    (isVercelPreview && !previewTestVendorEnabled) ||
    process.env.VERCEL_ENV === "production" ||
    (!isVercelPreview &&
      process.env.NODE_ENV === "production")
  ) {
    notFound();
  }
  return <VendorTestClient />;
}
