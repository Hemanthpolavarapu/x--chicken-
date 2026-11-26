"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CATEGORIES } from "@/data/categories";

export function HeroBanner() {
  const { selectedCategory, setSelectedCategory } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const heroBanners = [
    {
      tag: "100% STORE FRESH • NEVER FROZEN",
      title: "Cut Fresh Today. Delivered in 15 Min.",
      sub: "Direct from our sanitized neighborhood chicken store to your kitchen. Zero ice crystals, zero thaw water.",
      gradient: "from-[#D11243] via-[#A90E35] to-[#6D0821]",
      btnText: "Shop Curry Cuts",
      targetCategory: "curry-cut",
      img: "/images/hero/hero-1.jpg",
      fallbackImg:
        "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=900&q=80",
    },
    {
      tag: "HIGH-PROTEIN BONELESS & MINCE",
      title: "Pure Tender Chicken. Zero Preservatives.",
      sub: "Hand-trimmed boneless fillets, cubes & store-ground keema. Chilled at 0°C–4°C, never blast-frozen.",
      gradient: "from-[#1C1E21] via-[#2D1A22] to-[#8B1132]",
      btnText: "Explore Boneless",
      targetCategory: "boneless-mince",
      img: "/images/hero/hero-2.jpg",
      fallbackImg:
        "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=80",
    },
    {
      tag: "CHICKEN SPECIALISTS • EXPRESS HUB",
      title: "Biryani, Drumsticks & Speciality Cuts.",
      sub: "Only fresh poultry, zero cross-contamination. Butchered to order and dispatched in 15 minutes.",
      gradient: "from-[#B71C1C] via-[#9E142E] to-[#3B0A18]",
      btnText: "View Speciality Cuts",
      targetCategory: "speciality-cuts",
      img: "/images/hero/hero-3.jpg",
      fallbackImg:
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80",
    },
  ];

  // Auto-scroll hero banners every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, heroBanners.length]);

  const checkScroll = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollCategoriesRight = () => {
    categoryScrollRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  };

  const scrollToProducts = () => {
    const el = document.getElementById("cuts-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff > 40) handleNextSlide();
      else if (diff < -40) handlePrevSlide();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const current = heroBanners[activeSlide];

  return (
    <section className="bg-[#FFF2F4]">
      {/* HERO CAROUSEL (Restored original rich banner gradients inside #FFF2F4 section, no divider lines) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-3 sm:pt-5 sm:pb-4">
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`relative bg-linear-to-r ${current.gradient} text-white p-5 sm:p-8 md:p-10 transition-all duration-500 min-h-[195px] sm:min-h-[250px] flex items-center`}
          >
            {/* Right-aligned clean chicken photography */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-[46%] pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent z-10 sm:from-black/35" />
              <img
                src={current.img}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== current.fallbackImg) {
                    target.src = current.fallbackImg;
                  }
                }}
                alt={current.title}
                className="w-full h-full object-cover object-center opacity-45 sm:opacity-90 transition-transform duration-700"
              />
            </div>

            <div className="relative z-20 max-w-lg space-y-2.5 sm:space-y-3.5">
              {/* Top micro pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/25">
                  <Flame className="w-3 h-3 fill-current text-amber-300" />
                  {current.tag}
                </span>
                <span className="text-[11px] text-white/90 font-bold hidden sm:inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> 15 min Express
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

              {/* CTA & Dot indicators */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setSelectedCategory(current.targetCategory);
                    scrollToProducts();
                  }}
                  className="bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>{current.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D11243]" />
                </button>

                <div className="flex items-center gap-1.5 ml-2">
                  {heroBanners.map((_, i) => (
                    <button
                      key={i}
                      suppressHydrationWarning
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === i
                          ? "w-5 sm:w-6 bg-white"
                          : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/75"
                      }`}
                      aria-label={`Go to banner ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Left/Right Scroll Arrows */}
            <button
              suppressHydrationWarning
              onClick={handlePrevSlide}
              aria-label="Previous banner"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 hover:bg-black/55 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              suppressHydrationWarning
              onClick={handleNextSlide}
              aria-label="Next banner"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 hover:bg-black/55 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* LICIOUS-STYLE HORIZONTAL CATEGORY NAVIGATION (Seamless #FFF2F4 background, no divider line) */}
      <div className="bg-[#FFF2F4]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
          <div
            ref={categoryScrollRef}
            onScroll={checkScroll}
            className="flex items-start justify-start sm:justify-center gap-5 sm:gap-10 overflow-x-auto pt-3 pb-0 scrollbar-none no-scrollbar scroll-smooth"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  suppressHydrationWarning
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    scrollToProducts();
                  }}
                  className={`flex flex-col items-center gap-2 shrink-0 group cursor-pointer pb-3 border-b-2 transition-all ${
                    isSelected
                      ? "border-black"
                      : "border-transparent hover:border-black/30"
                  }`}
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#FFF2F4] transition-all shadow-2xs ${
                      isSelected
                        ? "border-2 border-black ring-2 ring-black/10 scale-105"
                        : "border border-[#F0C2CC] group-hover:border-black group-hover:scale-105"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs text-center max-w-[78px] sm:max-w-[92px] leading-tight whitespace-normal transition-colors text-black ${
                      isSelected ? "font-black" : "font-semibold opacity-80 group-hover:opacity-100"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Navigation Arrow when more categories are scrollable */}
          {canScrollRight && (
            <button
              suppressHydrationWarning
              onClick={scrollCategoriesRight}
              aria-label="Scroll categories right"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-black/15 shadow-md flex items-center justify-center text-black hover:bg-gray-50 transition-colors cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
