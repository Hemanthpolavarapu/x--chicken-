"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { Flame, Layers, ShieldCheck, ShoppingBag } from "lucide-react";

export function BottomMobileNav() {
  const { totalItems, subtotal, setIsCartOpen, setSelectedCategory, isMounted } = useCart();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToCategories = () => {
    const el = document.getElementById("cuts-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToGuarantee = () => {
    const el = document.getElementById("never-frozen-truth");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-3 py-2 flex items-center justify-around shadow-lg safe-area-pb">
      <button
        onClick={scrollToTop}
        className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#D11243] transition-colors"
      >
        <Flame className="w-5 h-5 text-[#D11243]" />
        <span className="text-[10px] font-bold">Fresh</span>
      </button>

      <button
        onClick={scrollToCategories}
        className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#D11243] transition-colors"
      >
        <Layers className="w-5 h-5 text-gray-500" />
        <span className="text-[10px] font-bold">Categories</span>
      </button>

      <button
        onClick={scrollToGuarantee}
        className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#D11243] transition-colors"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span className="text-[10px] font-bold">Zero Frozen</span>
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#D11243] transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-[#D11243]" />
          {isMounted && totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#FF7A00] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">
          {isMounted && totalItems > 0 ? `₹${subtotal}` : "Cart"}
        </span>
      </button>
    </div>
  );
}
