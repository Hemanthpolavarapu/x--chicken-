"use client";

import React from "react";
import { Truck, Store, Scissors, Home, Zap } from "lucide-react";

export function FourStepProcess() {
  const steps = [
    {
      num: "01",
      icon: Truck,
      title: "Daily Morning Farm Sourcing",
      description: "Healthy young birds picked up at 3:30 AM daily from audited bio-secure farms. Fed natural vegetarian grain.",
      badge: "4:00 AM Daily",
      accent: "#FF7A00",
    },
    {
      num: "02",
      icon: Store,
      title: "Neighborhood Store Hub",
      description: "Delivered straight to your local X-Chicken cutting retail store. Kept constantly chilled at 0°C to 4°C. Zero deep freezing.",
      badge: "0°C - 4°C Chill Chain",
      accent: "#D11243",
    },
    {
      num: "03",
      icon: Scissors,
      title: "Butchered Fresh Upon Order",
      description: "Master butchers cut, skin, debone, and trim precision portions strictly after you hit buy. Zero pre-cut old meat.",
      badge: "Sterile Ozone Cleaned",
      accent: "#8B5CF6",
    },
    {
      num: "04",
      icon: Home,
      title: "30-Min Insulated Delivery",
      description: "Packed in food-grade insulated thermal ice-packs and rushed to your kitchen in under 30-45 minutes.",
      badge: "⚡ Under 30 Mins",
      accent: "#0E9F6E",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F8F9FB] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Zap className="w-3.5 h-3.5 text-[#FF7A00]" />
            Speed & Freshness Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            How Fresh Chicken Reaches You in <span className="text-[#D11243]">4 Simple Steps</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            From the morning farm run to your pan in 30 minutes. Full transparency at every phase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {/* Step indicator header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: step.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-gray-200 font-mono">
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-4">
                  <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#D11243] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Badge */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md inline-block">
                    {step.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
