"use client";

import React, { useState } from "react";
import { Zap, Copy, Check, Flame, Sparkles } from "lucide-react";

export function DailyOffersBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText("EXPRESS50");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#D11243] via-[#B71C1C] to-[#1C1E21] p-6 sm:p-8 text-white shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#FF7A00]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                First Order Special
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Get <span className="text-[#FF7A00]">Flat ₹50 OFF</span> On Your 1st Fresh Cut Order
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 max-w-xl">
                Experience the difference of truly fresh, cut-to-order poultry. Delivered in 30 minutes straight from our neighborhood butchery store.
              </p>
            </div>

            {/* Coupon Code Pill */}
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shrink-0">
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-dashed border-amber-300/60 font-mono text-base font-black tracking-widest text-amber-300">
                EXPRESS50
              </div>
              <button
                suppressHydrationWarning
                onClick={handleCopy}
                className="bg-[#FF7A00] hover:bg-[#E06000] text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-gray-950" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
