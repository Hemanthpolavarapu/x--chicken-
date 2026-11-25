"use client";

import React, { useState } from "react";
import {
  MapPin,
  Search,
  ShoppingBag,
  ChevronDown,
  Zap,
  Flame,
  X,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { LocationModal } from "./LocationModal";

export function Navbar() {
  const {
    totalItems,
    subtotal,
    setIsCartOpen,
    selectedLocation,
    searchQuery,
    setSearchQuery,
    isMounted,
  } = useCart();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              <a href="#" className="flex items-center gap-2 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-[#D11243] via-[#E21B4B] to-[#FF7A00] flex items-center justify-center text-white shadow-sm shadow-[#D11243]/20 group-hover:scale-105 transition-transform">
                  <div className="relative flex items-center justify-center">
                    <Flame className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white drop-shadow-sm" />
                    <span className="absolute text-[9px] sm:text-[11px] font-black tracking-tighter text-[#D11243] bg-white rounded-full px-0.5 sm:px-1 -bottom-1 -right-1 shadow-xs">
                      X
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-2xl font-black tracking-tight text-gray-950 font-sans">
                      X<span className="text-[#D11243]">-CHICKEN</span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase bg-[#FFF0F2] text-[#D11243] px-1 py-0.2 rounded border border-[#FFE2E6]">
                      Express
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500 tracking-wide">
                    Store-Fresh • <span className="text-[#0E9F6E]">Zero Frozen</span>
                  </span>
                </div>
              </a>

              {/* Location Picker */}
              <button
                suppressHydrationWarning
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] flex items-center justify-center text-[#D11243]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="text-gray-400 font-medium flex items-center gap-1">
                    Store Delivery To
                    <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 transition-transform group-hover:translate-y-0.5" />
                  </span>
                  <span className="font-bold text-gray-800 max-w-[150px] truncate">
                    {selectedLocation}
                  </span>
                </div>
                <span className="ml-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> 15 min
                </span>
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="flex-1 max-w-lg hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search cuts (e.g. Biryani Cut, Boneless Breast, Keema, Wings...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-gray-100/80 focus:bg-white border border-transparent focus:border-[#D11243] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-3 focus:ring-[#D11243]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    suppressHydrationWarning
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Support Call */}
              <a
                href="tel:1800123456"
                className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#D11243] transition-colors px-2 py-1"
                title="Freshness & Order Hotline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>1800-X-CHICKEN</span>
              </a>

              {/* Cart Button */}
              <button
                suppressHydrationWarning
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-3 bg-[#D11243] hover:bg-[#B00E37] text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-[#D11243]/25 hover:shadow-lg hover:shadow-[#D11243]/35 transition-all cursor-pointer group"
                aria-label="View Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {isMounted && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF7A00] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-white/80 uppercase font-medium leading-tight">
                    My Cart
                  </span>
                  <span className="text-sm font-extrabold leading-tight">
                    {isMounted && totalItems > 0 ? `₹${subtotal}` : "Cart Empty"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search & Mobile Location Strip */}
          <div className="md:hidden pb-3 pt-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <button
                suppressHydrationWarning
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1.5 font-bold text-gray-900 truncate"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D11243] shrink-0" />
                <span className="truncate">{selectedLocation}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              <span className="shrink-0 text-[11px] font-bold text-green-700 bg-green-100/70 px-2 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> 15 min
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search cuts: Biryani, Curry Cut, Keema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-100 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D11243]"
              />
              {searchQuery && (
                <button
                  suppressHydrationWarning
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
}
