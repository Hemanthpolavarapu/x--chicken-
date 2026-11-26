"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Zap } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, isMounted } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const activeVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : product.originalPrice;
  const displayDiscount = activeVariant ? activeVariant.discountPercentage : product.discountPercentage;
  const displayWeight = activeVariant ? activeVariant.netWeight : product.netWeight;
  const displayPieces = activeVariant ? activeVariant.pieces : product.pieces;
  const displayServes = activeVariant ? activeVariant.serves : product.serves;

  const cartItem = isMounted
    ? items.find(
        (item) =>
          item.product.id === product.id &&
          (item.selectedVariant?.id || product.variants[0]?.id) === activeVariant?.id
      )
    : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Clean Product Image linking to dedicated product page */}
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-16/10 w-full overflow-hidden bg-gray-100 block"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Non-veg indicator (top-right) */}
        <div
          className="absolute top-2.5 right-2.5 w-4 h-4 bg-white border border-[#8B1E24] rounded-[2px] flex items-center justify-center shadow-2xs"
          title="Non-Veg"
        >
          <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-[#8B1E24]" />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <Link
            href={`/product/${product.id}`}
            className="font-bold text-gray-950 text-base leading-snug group-hover:text-[#D11243] transition-colors line-clamp-1 block"
            title={product.name}
          >
            {product.name}
          </Link>

          <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Weight | Pieces | Serves + Variant selector */}
        <div className="space-y-2">
          <p className="text-xs text-gray-700 font-medium">
            <span className="font-bold text-gray-950">{displayWeight}</span>
            <span className="text-gray-300 mx-1.5">|</span>
            <span>{displayPieces}</span>
            <span className="text-gray-300 mx-1.5">|</span>
            <span>Serves {displayServes.replace(" People", "")}</span>
          </p>

          {product.variants.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {product.variants.map((variant, idx) => {
                const isSelected = idx === selectedVariantIdx;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFF0F2] text-[#D11243] border-[#D11243]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-gray-950">₹{displayPrice}</span>
          <span className="text-xs text-gray-400 line-through">₹{displayOriginalPrice}</span>
          <span className="text-xs font-bold text-[#0E9F6E]">{displayDiscount}% off</span>
        </div>

        {/* Bottom Row: Today in 15 mins + Add + button */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-5 h-5 rounded-full bg-[#FDE68A] flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
            </span>
            <span>Today in 15 mins</span>
          </div>

          <div className="shrink-0">
            {quantity === 0 ? (
              <button
                suppressHydrationWarning
                onClick={() => addItem(product, undefined, activeVariant)}
                className="flex items-center gap-1.5 bg-[#D11243] hover:bg-[#B00E37] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <div className="flex items-center bg-[#D11243] text-white rounded-lg overflow-hidden shadow-xs">
                <button
                  suppressHydrationWarning
                  onClick={() => updateQuantity(product.id, -1, activeVariant?.id)}
                  className="px-2.5 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-xs font-black min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  suppressHydrationWarning
                  onClick={() => updateQuantity(product.id, 1, activeVariant?.id)}
                  className="px-2.5 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
