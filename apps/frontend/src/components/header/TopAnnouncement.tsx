"use client";

import React from "react";
import { Zap } from "lucide-react";

export function TopAnnouncement() {
  return (
    <div className="bg-white text-black text-xs sm:text-sm py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-[#D11243] text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-current" /> Express 15 min
          </span>
          <span className="font-bold text-black tracking-wide text-xs sm:text-sm">
            STRICTLY NO FROZEN CHICKEN
          </span>
        </div>
      </div>
    </div>
  );
}
