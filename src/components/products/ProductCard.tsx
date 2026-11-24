"use client";

import React from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Star, Plus, Minus, Zap, Flame } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity, setQuickViewProduct, isMounted } = useCart();

  const cartItem = isMounted ? items.find((item) => item.product.id === product.id) : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Product Image */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => setQuickViewProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-70" />

        {/* Badge: Bestseller / Zero Frozen */}
        {product.badge && (
          <div className="absolute top-2 left-2">
            <span
              className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-xs ${
                product.badge === "Zero Frozen"
                  ? "bg-[#0E9F6E] text-white"
                  : product.badge === "Bestseller"
                  ? "bg-[#D11243] text-white"
                  : product.badge === "Farm Direct"
                  ? "bg-[#FF7A00] text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Express tag */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black text-gray-900 flex items-center gap-0.5 shadow-xs">
          <Zap className="w-2.5 h-2.5 text-[#FF7A00] fill-[#FF7A00]" />
          <span>30m</span>
        </div>

        {/* Bottom Weight & Pieces */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white text-[10px] sm:text-[11px] font-semibold">
          <span className="bg-black/50 backdrop-blur-xs px-1.5 py-0.2 rounded truncate max-w-[65%]">
            {product.netWeight}
          </span>
          <span className="bg-black/50 backdrop-blur-xs px-1.5 py-0.2 rounded truncate">
            {product.pieces.split(" ")[0]} pcs
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Star rating and serving */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
            <div className="flex items-center gap-1 font-bold text-gray-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">
              <Star className="w-2.5 h-2.5 fill-[#FF7A00] text-[#FF7A00]" />
              <span>{product.rating}</span>
            </div>
            <span className="text-gray-400 font-medium text-[10px] truncate">
              Serves {product.serves.split(" ")[0]}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => setQuickViewProduct(product)}
            className="font-bold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-[#D11243] transition-colors cursor-pointer line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Micro Freshness Pill */}
        <div className="py-1 px-1.5 rounded-md bg-[#FFF0F2] flex items-center justify-between text-[9px] sm:text-[10px]">
          <span className="font-bold text-[#D11243] flex items-center gap-1 truncate">
            <Flame className="w-2.5 h-2.5 shrink-0" /> Cut Today
          </span>
          <span className="text-gray-500 font-medium text-[9px] hidden sm:inline">0-4°C</span>
        </div>

        {/* Price & Add CTA */}
        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-gray-950">₹{product.price}</span>
              <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>
            </div>
            <span className="text-[9px] font-bold text-[#0E9F6E] block">
              {product.discountPercentage}% OFF
            </span>
          </div>

          {/* Stepper / Add */}
          <div className="shrink-0">
            {quantity === 0 ? (
              <button
                suppressHydrationWarning
                onClick={() => addItem(product)}
                className="flex items-center gap-1 bg-[#FFF0F2] hover:bg-[#D11243] text-[#D11243] hover:text-white font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#D11243]/30 hover:border-transparent transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center bg-[#D11243] text-white rounded-lg overflow-hidden shadow-xs">
                <button
                  suppressHydrationWarning
                  onClick={() => updateQuantity(product.id, -1)}
                  className="px-2 py-1 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="px-1.5 text-xs font-black min-w-[16px] text-center">
                  {quantity}
                </span>
                <button
                  suppressHydrationWarning
                  onClick={() => updateQuantity(product.id, 1)}
                  className="px-2 py-1 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
