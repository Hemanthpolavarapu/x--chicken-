"use client";

import React, { useState } from "react";
import {
  Zap,
  ShieldCheck,
  Snowflake,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CATEGORIES } from "@/data/categories";

export function HeroBanner() {
  const { setSelectedCategory, selectedLocation } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroBanners = [
    {
      tag: "100% STORE FRESH",
      title: "Cut Today. Never Frozen.",
      sub: "Direct from our local store butchery to your kitchen in 15 mins.",
      highlight: "Zero thaw water loss. 100% tender meat.",
      badgeColor: "bg-[#D11243]",
      gradient: "from-[#D11243] via-[#B71C1C] to-[#880E4F]",
      btnText: "Explore Fresh Cuts",
      img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=700&q=80",
    },
    {
      tag: "EXPRESS SPEED",
      title: "Store To Door In 15 Mins",
      sub: "Dispatched from neighborhood chilled store hubs (0°C – 4°C).",
      highlight: "Live tracking with insulated cold-chain packs.",
      badgeColor: "bg-[#FF7A00]",
      gradient: "from-[#FF7A00] via-[#E65100] to-[#BF360C]",
      btnText: "Order Express Cut",
      img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80",
    },
    {
      tag: "CHICKEN SPECIALISTS",
      title: "Zero Supermarket Freezers",
      sub: "Only chicken, zero cross-contamination, 100% Halal certified.",
      highlight: "Cleaned with ozone water & precision butchered.",
      badgeColor: "bg-emerald-600",
      gradient: "from-emerald-700 via-emerald-800 to-gray-900",
      btnText: "View Halal Cuts",
      img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=80",
    },
  ];

  const current = heroBanners[activeSlide];

  const scrollToProducts = () => {
    const el = document.getElementById("cuts-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white border-b border-gray-100 pt-3 pb-4 sm:pt-4 sm:pb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* Compact, Sleek App-Style Hero Banner Carousel */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
          <div
            className={`relative bg-linear-to-r ${current.gradient} text-white p-4 sm:p-7 md:p-8 transition-all duration-500`}
          >
            {/* Subtle background overlay image */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/2 opacity-25 sm:opacity-35 pointer-events-none overflow-hidden">
              <img
                src={current.img}
                alt="X-Chicken cut"
                className="w-full h-full object-cover object-center mix-blend-luminosity scale-110"
              />
            </div>

            <div className="relative z-10 max-w-xl space-y-2 sm:space-y-3">
              {/* Top micro pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                  <Flame className="w-3 h-3 fill-current text-amber-300" />
                  {current.tag}
                </span>
                <span className="text-[11px] text-white/80 font-semibold hidden sm:inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> 15m Express
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
                {current.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-white/90 leading-snug line-clamp-2 max-w-md">
                {current.sub}
              </p>

              {/* Action Button & Indicators */}
              <div className="flex items-center gap-3 pt-1 sm:pt-2">
                <button
                  suppressHydrationWarning
                  onClick={scrollToProducts}
                  className="bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>{current.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D11243]" />
                </button>

                {/* Banner dot indicators */}
                <div className="flex items-center gap-1.5 ml-2">
                  {heroBanners.map((_, i) => (
                    <button
                      key={i}
                      suppressHydrationWarning
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === i
                          ? "w-5 sm:w-6 bg-white"
                          : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Native Fast Category Story Circles (Centered On Both Sides) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-2 sm:px-4 max-w-5xl mx-auto">
            <span className="text-xs font-black text-gray-900 tracking-tight uppercase">
              Explore Fresh Cuts
            </span>
            <span
              className="text-[11px] font-bold text-[#D11243] flex items-center gap-0.5 cursor-pointer hover:underline"
              onClick={scrollToProducts}
            >
              See All ({CATEGORIES.length}) <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none no-scrollbar pt-1 mx-auto max-w-5xl px-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                suppressHydrationWarning
                onClick={() => {
                  setSelectedCategory(cat.id);
                  scrollToProducts();
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-b from-[#FFF0F2] to-white border border-[#FFE2E6] flex items-center justify-center p-2.5 group-hover:scale-105 group-hover:border-[#D11243] transition-all shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#D11243]">
                    <Flame className="w-4 h-4 fill-[#D11243]" />
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-gray-800 text-center max-w-[80px] sm:max-w-[90px] truncate leading-tight group-hover:text-[#D11243]">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lightweight Trust Pill Strip */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-100/70 text-[#D11243] flex items-center justify-center shrink-0">
              <Snowflake className="w-3.5 h-3.5 line-through" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                Zero Frozen
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block">
                No thaw water
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-100/70 text-[#FF7A00] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                Cut To Order
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block">
                Store-fresh today
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                100% Halal
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block">
                Chemical free
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
