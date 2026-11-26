"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { CATEGORIES } from "@/data/categories";
import {
  Layers,
  UtensilsCrossed,
  Flame,
  Sparkles,
  PartyPopper,
  Crown,
  Scissors,
} from "lucide-react";

export function CategoryNav() {
  const { selectedCategory, setSelectedCategory, setSearchQuery } = useCart();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Layers":
        return Layers;
      case "UtensilsCrossed":
        return UtensilsCrossed;
      case "Flame":
        return Flame;
      case "Sparkles":
        return Sparkles;
      case "PartyPopper":
        return PartyPopper;
      case "Crown":
        return Crown;
      case "Scissors":
        return Scissors;
      default:
        return Layers;
    }
  };

  const handleSelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery(""); // reset search when clicking category
  };

  return (
    <div className="border-b border-gray-100 bg-white sticky top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = getIcon(cat.icon);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                suppressHydrationWarning
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#D11243] text-white shadow-md shadow-[#D11243]/25 scale-102"
                    : "bg-gray-100/80 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? "bg-white/25 text-white" : "bg-gray-200/80 text-gray-600"
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
