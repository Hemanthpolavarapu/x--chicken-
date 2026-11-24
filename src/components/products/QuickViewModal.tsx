"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Utensils,
  Flame,
  Zap,
} from "lucide-react";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addItem, items, updateQuantity, isMounted } = useCart();
  const [selectedCut, setSelectedCut] = useState("Standard Fresh Store Cut");

  if (!quickViewProduct) return null;

  const cartItem = isMounted ? items.find((item) => item.product.id === quickViewProduct.id) : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  const cutOptions = [
    "Standard Fresh Store Cut",
    "Small Curry Pieces (16-18 pcs)",
    "Medium Curry Pieces (12-14 pcs)",
    "Extra Trimming (Zero excess skin)",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Top bar with close */}
        <div className="relative aspect-16/9 w-full bg-gray-900 shrink-0">
          <img
            src={quickViewProduct.image}
            alt={quickViewProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />

          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tag */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#D11243] text-white text-xs font-black uppercase px-3 py-1 rounded-md shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" /> Cut Fresh Today
            </span>
          </div>

          {/* Title on image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-current" /> {quickViewProduct.rating} (
                {quickViewProduct.reviewsCount} reviews)
              </span>
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                Net: {quickViewProduct.netWeight}
              </span>
            </div>
            <h2 className="text-2xl font-black">{quickViewProduct.name}</h2>
            {quickViewProduct.hindiName && (
              <p className="text-xs text-gray-300 font-medium">{quickViewProduct.hindiName}</p>
            )}
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Net Weight</span>
              <span className="text-xs font-black text-gray-900">{quickViewProduct.netWeight}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Gross Wt</span>
              <span className="text-xs font-black text-gray-900">{quickViewProduct.grossWeight}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Pieces</span>
              <span className="text-xs font-black text-gray-900">{quickViewProduct.pieces}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Serves</span>
              <span className="text-xs font-black text-gray-900">{quickViewProduct.serves}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
              Butcher's Description & Freshness Guarantee
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              {quickViewProduct.fullDescription}
            </p>
          </div>

          {/* Temperature & Batch Info */}
          <div className="p-3.5 rounded-xl bg-[#FFF0F2] border border-[#FFE2E6] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D11243]">
              <Clock className="w-4 h-4" />
              <span>{quickViewProduct.freshnessBatch}</span>
            </div>
            <p className="text-xs text-gray-600">
              Chamber temperature: <span className="font-semibold">{quickViewProduct.temperatureAtStore}</span>. Strictly never allowed to freeze or thaw.
            </p>
          </div>

          {/* Ideal Dishes */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#D11243]" />
              Ideal For Cooking:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {quickViewProduct.idealFor.map((dish, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>

          {/* Custom Cut Selection */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
              Select Custom Store Cut Preference:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cutOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedCut(opt)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    selectedCut === opt
                      ? "border-[#D11243] bg-[#FFF0F2] text-[#D11243] font-bold"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  ✓ {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Price and Add to Cart */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-950">₹{quickViewProduct.price}</span>
              <span className="text-xs text-gray-400 line-through">₹{quickViewProduct.originalPrice}</span>
            </div>
            <span className="text-[11px] text-green-700 font-bold">
              {quickViewProduct.discountPercentage}% OFF • Taxes included
            </span>
          </div>

          <div>
            {quantity === 0 ? (
              <button
                onClick={() => {
                  addItem(quickViewProduct, selectedCut);
                  setQuickViewProduct(null);
                }}
                className="bg-[#D11243] hover:bg-[#B00E37] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Express Cart</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#D11243] text-white rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => updateQuantity(quickViewProduct.id, -1)}
                    className="px-3 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-black min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quickViewProduct.id, 1)}
                    className="px-3 py-2 hover:bg-[#B00E37] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="text-xs font-bold text-gray-600 underline"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
