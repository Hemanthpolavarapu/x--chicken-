"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  X,
  Zap,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { LocationModal } from "./LocationModal";

export function Navbar() {
  const {
    totalItems,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    isMounted,
    deliveryLocation,
    deliveryEligibility,
    isLocationModalOpen,
    setIsLocationModalOpen,
  } = useCart();
  const { customer } = useAuth();
  const [isFirstVisitPrompt, setIsFirstVisitPrompt] = useState(false);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const savedLoc = localStorage.getItem("xchicken_delivery_location");
      const prompted = localStorage.getItem("xchicken_location_prompted");
      if (!savedLoc && !prompted) {
        setIsFirstVisitPrompt(true);
        setIsLocationModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, [isMounted, setIsLocationModalOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Left: Logo + Zomato-style Location Selector + Verified Express 15 min indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsFirstVisitPrompt(false);
                setIsLocationModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100/80 hover:bg-[#FFF0F2] border border-gray-200/80 hover:border-[#F9C4CE] text-left min-w-0 max-w-[180px] sm:max-w-[230px] cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D11243] shrink-0" />
              <span className="text-xs font-bold text-gray-800 truncate">
                {isMounted && deliveryLocation
                  ? deliveryLocation.area || deliveryLocation.addressLine
                  : "Select Location"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </button>

            {isMounted && deliveryEligibility.checked && deliveryEligibility.express15MinEligible ? (
              <span className="hidden sm:inline-flex items-center gap-1 bg-[#D11243] text-white font-bold px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider shrink-0 shadow-sm shadow-[#D11243]/30">
                <Zap className="w-3 h-3 fill-current" /> Express 15-min delivery
              </span>
            ) : isMounted && deliveryEligibility.checked && deliveryEligibility.eligible ? (
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-full text-[11px] shrink-0">
                ~{deliveryEligibility.estimatedMins} min delivery
              </span>
            ) : isMounted && deliveryEligibility.checked && deliveryLocation?.lat != null ? (
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-full text-[11px] shrink-0">
                Outside Express Zone
              </span>
            ) : null}
          </div>

          {/* Right: Search Bar + Small Cart Icon */}
          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
            {/* Desktop Search Bar on right side */}
            <div className="hidden md:block w-64 lg:w-80">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-full bg-gray-100/80 focus:bg-white border border-transparent focus:border-[#D11243] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-3 focus:ring-[#D11243]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    suppressHydrationWarning
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Account Icon Link (Login / Profile) */}
            <Link
              href={customer ? "/account" : "/login"}
              className="relative w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-[#FFF0F2] text-gray-700 hover:text-[#D11243] border border-gray-200/80 hover:border-[#F9C4CE] flex items-center justify-center transition-all shrink-0"
              aria-label={customer ? "My Account" : "Sign In"}
              title={customer ? `Signed in as ${customer.name}` : "Sign In"}
            >
              <User className="w-5 h-5" />
              {customer && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </Link>

            {/* Small Cart Icon Button ONLY */}
            <button
              suppressHydrationWarning
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-xl bg-[#FFF0F2] hover:bg-[#D11243] text-[#D11243] hover:text-white border border-[#F9C4CE] hover:border-[#D11243] flex items-center justify-center transition-all cursor-pointer shrink-0 group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-105" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D11243] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-100 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D11243]"
            />
            {searchQuery && (
              <button
                suppressHydrationWarning
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        isFirstVisitPrompt={isFirstVisitPrompt}
      />
    </header>
  );
}
