"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { X, Plus, Minus, Zap, Scale, PlayCircle } from "lucide-react";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addItem, items, updateQuantity, isMounted } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!quickViewProduct) return null;

  const activeVariant = quickViewProduct.variants[selectedVariantIdx] || quickViewProduct.variants[0];
  const displayPrice = activeVariant ? activeVariant.price : quickViewProduct.price;
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : quickViewProduct.originalPrice;
  const displayDiscount = activeVariant ? activeVariant.discountPercentage : quickViewProduct.discountPercentage;
  const displayWeight = activeVariant ? activeVariant.netWeight : quickViewProduct.netWeight;

  const cartItem = isMounted
    ? items.find(
        (item) =>
          item.product.id === quickViewProduct.id &&
          (item.selectedVariant?.id || quickViewProduct.variants[0]?.id) === activeVariant?.id
      )
    : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  const categoryName =
    CATEGORIES.find((c) => c.id === quickViewProduct.category)?.name || "Chicken";

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== quickViewProduct.id
  ).slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-8 space-y-8">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap pr-10">
            <span
              className="hover:text-gray-900 cursor-pointer"
              onClick={() => setQuickViewProduct(null)}
            >
              Home
            </span>
            <span>/</span>
            <span className="hover:text-gray-900 cursor-pointer">{categoryName}</span>
            <span>/</span>
            <span className="text-[#D11243] font-semibold">{quickViewProduct.name}</span>
          </nav>

          {/* Main 2-column Product Detail (Licious style, zero Hindi text) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left: Product Image */}
            <div className="md:col-span-6">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
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
            <div className="md:col-span-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">
                  {quickViewProduct.name}
                </h2>

                {/* Weight / Variant pills */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {quickViewProduct.variants.map((variant, idx) => {
                    const isSelected = idx === selectedVariantIdx;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
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
                    • {activeVariant?.pieces || quickViewProduct.pieces} • Serves{" "}
                    {activeVariant?.serves || quickViewProduct.serves}
                  </span>
                </div>
              </div>

              {/* Promo Offer Strip */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#EAFBF3] border border-[#C6F0DA] flex items-center justify-between gap-3">
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
                  {showFullDesc
                    ? quickViewProduct.fullDescription
                    : quickViewProduct.shortDescription}
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
              <div className="pt-2 pb-3 border-b border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-950">₹{displayPrice}</span>
                    <span className="text-xs font-bold text-[#0E9F6E]">{displayDiscount}% off</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    MRP: <span className="line-through">₹{displayOriginalPrice}</span> (incl. of all taxes)
                  </p>
                </div>

                <div>
                  {quantity === 0 ? (
                    <button
                      onClick={() => addItem(quickViewProduct, undefined, activeVariant)}
                      className="bg-[#D11243] hover:bg-[#B00E37] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Add</span>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#D11243] text-white rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(quickViewProduct.id, -1, activeVariant?.id)}
                        className="px-3 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-black min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(quickViewProduct.id, 1, activeVariant?.id)}
                        className="px-3 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Link + Today in 15 mins */}
              <div className="flex items-center justify-between gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 text-[#D11243] font-semibold">
                  <PlayCircle className="w-4 h-4 shrink-0" />
                  <span className="underline">{quickViewProduct.name}</span>
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

          {/* You may also like */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="text-base sm:text-lg font-black text-gray-950">You may also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    setSelectedVariantIdx(0);
                    setShowFullDesc(false);
                    setQuickViewProduct(rel);
                  }}
                  className="rounded-xl border border-gray-200/80 overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative aspect-16/10 bg-gray-100 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-white border border-[#8B1E24] rounded-[2px] flex items-center justify-center">
                      <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[#8B1E24]" />
                    </div>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-[#D11243]">
                      {rel.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">{rel.netWeight}</p>
                    <p className="text-xs font-black text-gray-950">₹{rel.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
