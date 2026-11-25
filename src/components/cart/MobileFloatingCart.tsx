"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, ArrowRight, Zap } from "lucide-react";

export function MobileFloatingCart() {
  const { totalItems, subtotal, setIsCartOpen, isMounted } = useCart();

  if (!isMounted || totalItems === 0) return null;

  return (
    <div className="md:hidden fixed bottom-16 left-3 right-3 z-40 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-[#D11243] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/20 active:scale-98 transition-transform cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
            {totalItems}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-black block">₹{subtotal} Subtotal</span>
            <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-current text-amber-300" /> 15m Store Express
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
}
