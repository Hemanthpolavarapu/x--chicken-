import React from "react";
import { TopAnnouncement } from "@/components/header/TopAnnouncement";
import { Navbar } from "@/components/header/Navbar";
import { HeroBanner } from "@/components/hero/HeroBanner";
import { CategoryNav } from "@/components/products/CategoryNav";
import { ProductGrid } from "@/components/products/ProductGrid";
import { NeverFrozenComparison } from "@/components/freshness/NeverFrozenComparison";
import { FourStepProcess } from "@/components/freshness/FourStepProcess";
import { DailyOffersBanner } from "@/components/banner/DailyOffersBanner";
import { CustomerReviews } from "@/components/reviews/CustomerReviews";
import { ChickenFaq } from "@/components/faq/ChickenFaq";
import { Footer } from "@/components/footer/Footer";
import { QuickViewModal } from "@/components/products/QuickViewModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BottomMobileNav } from "@/components/navigation/BottomMobileNav";
import { MobileFloatingCart } from "@/components/cart/MobileFloatingCart";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] pb-14 md:pb-0" suppressHydrationWarning>
      {/* 1. Top Alert Strip */}
      <TopAnnouncement />

      {/* 2. Main Navigation Header */}
      <Navbar />

      <main className="flex-1">
        {/* 3. Hero Section with Express Pincode Checker */}
        <HeroBanner />

        {/* 4. Category Filter Navigation (Sticky) */}
        <CategoryNav />

        {/* 5. Fresh Cuts Product Grid */}
        <ProductGrid />

        {/* 6. First-Order Promo Banner */}
        <DailyOffersBanner />

        {/* 7. Never-Frozen vs Supermarket Comparison Table */}
        <NeverFrozenComparison />

        {/* 8. 4-Step Fresh Farm-to-Store Pipeline */}
        <FourStepProcess />

        {/* 9. Verified Buyer Reviews */}
        <CustomerReviews />

        {/* 10. Frequently Asked Questions */}
        <ChickenFaq />
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
