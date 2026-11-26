import { notFound } from "next/navigation";
import VendorTestClient from "./VendorTestClient";

export const dynamic = "force-dynamic";

export default function VendorTestEntryPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <VendorTestClient />;
}
