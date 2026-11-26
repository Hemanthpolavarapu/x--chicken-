"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/header/Navbar";
import { Footer } from "@/components/footer/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileFloatingCart } from "@/components/cart/MobileFloatingCart";
import { BottomMobileNav } from "@/components/navigation/BottomMobileNav";
import { ProductCard } from "@/components/products/ProductCard";
import { Plus, Minus, Zap, Scale, PlayCircle } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params?.id === "string" ? params.id : "";
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];

  const { addItem, items, updateQuantity, setSelectedCategory, isMounted } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const displayDiscount = activeVariant ? activeVariant.discountPercentage : product.discountPercentage;

  const cartItem = isMounted
    ? items.find(
        (item) =>
          item.product.id === product.id &&
          (item.selectedVariant?.id || product.variants[0]?.id) === activeVariant?.id
      )
    : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  const categoryName =
    CATEGORIES.find((c) => c.id === product.category)?.name || "Chicken";

  // Same-category products first, then remaining products so customers see plenty of options
  const sameCategory = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  );
  const otherProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category !== product.category
  );
  const similarProducts = [...sameCategory, ...otherProducts];

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 md:pb-0" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-gray-950 transition-colors">
              Home
            </Link>
            <span>/</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(product.category);
                router.push("/");
              }}
              className="hover:text-gray-950 transition-colors cursor-pointer"
            >
              {categoryName}
            </button>
            <span>/</span>
            <span className="text-[#D11243] font-semibold">{product.name}</span>
          </nav>

          {/* 2-Column Product Detail Section (Licious style, zero Hindi) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-start">
            {/* Left: Clean Product Image */}
            <div className="md:col-span-6">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Non-veg square badge */}
                <div
                  className="absolute top-3 right-3 w-5 h-5 bg-white border border-[#8B1E24] rounded-[2px] flex items-center justify-center shadow-xs"
                  title="Non-Veg"
                >
                  <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[#8B1E24]" />
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="md:col-span-6 space-y-5">
              <div className="space-y-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-950 leading-tight">
                  {product.name}
                </h1>

                {/* Weight / Variant Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {product.variants.map((variant, idx) => {
                    const isSelected = idx === selectedVariantIdx;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gray-100 border-gray-900 text-gray-950"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5 text-gray-600" />
                        <span>{variant.netWeight}</span>
                      </button>
                    );
                  })}
                  <span className="text-xs text-gray-500 font-medium">
                    • {activeVariant?.pieces || product.pieces} • Serves{" "}
                    {activeVariant?.serves || product.serves}
                  </span>
                </div>
              </div>

              {/* Promo Offer Strip */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#EAFBF3] border border-[#C6F0DA] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    Flat ₹50 off + Free delivery
                  </p>
                  <p className="text-[11px] text-gray-600">*On orders above ₹200</p>
                </div>
                <span className="bg-[#0B6634] text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">
                  Code : EXPRESS50
                </span>
              </div>

              {/* English-only description with Read more */}
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <p>
                  {showFullDesc ? product.fullDescription : product.shortDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setShowFullDesc((prev) => !prev)}
                  className="text-xs font-bold text-gray-950 hover:text-[#D11243] cursor-pointer"
                >
                  {showFullDesc ? "Read less" : "Read more"}
                </button>
              </div>

              {/* Price + Add + Button */}
              <div className="pt-3 pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-gray-950">
                      ₹{displayPrice}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0E9F6E]">
                      {displayDiscount}% off
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    MRP: <span className="line-through">₹{displayOriginalPrice}</span> (incl. of all taxes)
                  </p>
                </div>

                <div>
                  {quantity === 0 ? (
                    <button
                      suppressHydrationWarning
                      onClick={() => addItem(product, undefined, activeVariant)}
                      className="bg-[#D11243] hover:bg-[#B00E37] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Add</span>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#D11243] text-white rounded-lg overflow-hidden shadow-sm">
                      <button
                        suppressHydrationWarning
                        onClick={() => updateQuantity(product.id, -1, activeVariant?.id)}
                        className="px-3.5 py-2.5 hover:bg-[#B00E37] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-black min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        suppressHydrationWarning
                        onClick={() => updateQuantity(product.id, 1, activeVariant?.id)}
                        className="px-3.5 py-2.5 hover:bg-[#B00E37] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info Row: Cut Name + Today in 15 mins */}
              <div className="flex items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 text-[#D11243] font-semibold">
                  <PlayCircle className="w-4 h-4 shrink-0" />
                  <span className="underline">{product.name}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-700 font-medium shrink-0">
                  <span className="w-5 h-5 rounded-full bg-[#FDE68A] flex items-center justify-center">
                    <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                  </span>
                  <span>Today in 15 mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remaining Similar Products Section (Scroll down to discover & buy more) */}
          <div className="pt-8 border-t border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                You may also like
              </h2>
              <Link
                href="/"
                className="text-xs font-bold text-[#D11243] hover:underline"
              >
                View all  cuts →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileFloatingCart />
      <BottomMobileNav />
    </div>
  );
}
