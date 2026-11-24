"use client";

import React from "react";
import { Check, X, ShieldAlert, Sparkles, Droplets, Utensils, Clock, Award } from "lucide-react";

export function NeverFrozenComparison() {
  const comparisonRows = [
    {
      feature: "Storage History",
      icon: Clock,
      xChicken: "Arrives at store every morning. Cut fresh strictly upon your order.",
      xChickenGood: true,
      frozenMarket: "Kept in industrial blast freezers (-18°C) for 3 weeks to 3 months.",
      frozenBad: true,
    },
    {
      feature: "Net Meat vs Water Loss",
      icon: Droplets,
      xChicken: "100% Meat. 0% thawing water loss. You get every single gram you pay for.",
      xChickenGood: true,
      frozenMarket: "Loses 20% to 30% of weight when defrosted as cloudy water.",
      frozenBad: true,
    },
    {
      feature: "Meat Texture & Juiciness",
      icon: Sparkles,
      xChicken: "Natural cell structure intact. Naturally juicy, tender & springy.",
      xChickenGood: true,
      frozenMarket: "Ice crystals pierce muscle fibers, making meat dry, rubbery, and fibrous.",
      frozenBad: true,
    },
    {
      feature: "Chemicals & Glazing",
      icon: ShieldAlert,
      xChicken: "Zero preservatives, zero chlorine rinse, zero salt-water injections.",
      xChickenGood: true,
      frozenMarket: "Often treated with chemical glazes, polyphosphates, and brine to retain weight.",
      frozenBad: true,
    },
    {
      feature: "Cooking Experience",
      icon: Utensils,
      xChicken: "Ready to cook instantly. Absorbs spices deep into core in 15 mins.",
      xChickenGood: true,
      frozenMarket: "Requires 1-2 hours painful defrosting in microwave or lukewarm water.",
      frozenBad: true,
    },
    {
      feature: "Specialization Focus",
      icon: Award,
      xChicken: "100% Chicken Specialists. Zero cross-contamination with other meats.",
      xChickenGood: true,
      frozenMarket: "General warehouses handling multiple varieties with shared processing lines.",
      frozenBad: true,
    },
  ];

  return (
    <section id="never-frozen-truth" className="py-16 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#D11243] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The Unfiltered Truth
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Why <span className="text-[#D11243]">X-Chicken Store Fresh</span> Tastes 10x Better Than Frozen Meat
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Ever wondered why restaurant chicken curry is super juicy, while frozen supermarket chicken turns dry and chewy? Here is what happens behind the cold-storage curtain:
          </p>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md">
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-700">
            <div className="p-4 md:col-span-4 flex items-center gap-2 text-gray-900">
              <span>Quality Metric</span>
            </div>
            <div className="p-4 md:col-span-4 bg-[#FFF0F2] text-[#D11243] flex items-center justify-between border-x border-[#FFE2E6]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D11243]" />
                X-Chicken (Store Fresh Today)
              </span>
              <span className="text-[11px] uppercase bg-[#D11243] text-white px-2 py-0.5 rounded font-black">
                Winner
              </span>
            </div>
            <div className="p-4 md:col-span-4 text-gray-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Supermarket / Frozen Meat</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 bg-white">
            {comparisonRows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 text-sm hover:bg-gray-50/50 transition-colors"
                >
                  {/* Metric column */}
                  <div className="p-4 md:col-span-4 flex items-start gap-3 bg-white">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{row.feature}</div>
                    </div>
                  </div>

                  {/* X-Chicken column */}
                  <div className="p-4 md:col-span-4 bg-[#FFF9FA] border-x border-[#FFE2E6] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-gray-800 font-medium leading-snug">
                      {row.xChicken}
                    </span>
                  </div>

                  {/* Frozen market column */}
                  <div className="p-4 md:col-span-4 bg-white flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-gray-500 leading-snug">
                      {row.frozenMarket}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom takeaway box */}
        <div className="mt-8 p-6 rounded-2xl bg-linear-to-r from-[#FFF0F2] via-white to-[#FFF5EB] border border-[#FFE2E6] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-extrabold text-gray-900 text-base">
              The X-Chicken Zero-Frozen Guarantee
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              If your order ever arrives frozen solid or thawed from freezer storage, we refund 100% of your bill instantly. No questions asked.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-[#D11243] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs">
            <Award className="w-4 h-4 text-amber-300" />
            <span>100% Freshness Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
