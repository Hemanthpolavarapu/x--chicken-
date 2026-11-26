import React from "react";
import { Navbar } from "@/components/header/Navbar";
import { HeroBanner } from "@/components/hero/HeroBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FourStepProcess } from "@/components/freshness/FourStepProcess";
import { CustomerReviews } from "@/components/reviews/CustomerReviews";
import { Footer } from "@/components/footer/Footer";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BottomMobileNav } from "@/components/navigation/BottomMobileNav";
import { MobileFloatingCart } from "@/components/cart/MobileFloatingCart";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white pb-14 md:pb-0" suppressHydrationWarning>
      {/* 1. Main Navigation Header */}
      <Navbar />

      <main className="flex-1">
        {/* 3. Hero Section with Auto & Manual Scroll + Category Circles */}
        <HeroBanner />

        {/* 4. Fresh Cuts Product Grid with Filter Panel */}
        <ProductGrid />

        {/* 5. 4-Step Fresh Farm-to-Store Pipeline */}
        <FourStepProcess />

        {/* 6. Verified Buyer Reviews */}
        <CustomerReviews />
      </main>

      {/* 11. Comprehensive Brand Footer */}
      <Footer />

      {/* 12. Interactive Global Modals & Slide-overs */}
      <QuickViewModal />
      <CartDrawer />

      {/* 13. Mobile Native App Floating Cart & Bottom Navigation */}
      <MobileFloatingCart />
      <BottomMobileNav />
    </div>
  );
}
