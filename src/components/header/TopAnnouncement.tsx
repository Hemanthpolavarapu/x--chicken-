"use client";

import React from "react";
import { Zap, ShieldCheck, Clock, Award } from "lucide-react";

export function TopAnnouncement() {
  return (
    <div className="bg-[#1C1E21] text-white text-xs sm:text-sm py-2 px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-[#D11243] text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider animate-pulse">
            <Zap className="w-3 h-3 fill-current" /> Express 30m
          </span>
          <span className="font-medium text-gray-200 truncate">
            Cut Fresh From Neighborhood Store • <span className="text-[#FF7A00] font-semibold">STRICTLY NO FROZEN CHICKEN</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-gray-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E9F6E]" />
            <span>100% Halal Certified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Antibiotic & Chemical Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Today's Batch Cut Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
