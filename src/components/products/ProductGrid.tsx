"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { ProductCard } from "./ProductCard";
import { Sparkles, X, SlidersHorizontal } from "lucide-react";

const FILTER_SECTIONS = [
  {
    key: "chickenType",
    label: "Chicken type",
    options: ["Broiler", "Country"],
  },
  {
    key: "boneType",
    label: "Bone type",
    options: ["Bone-in", "Boneless", "Partly Boneless"],
  },
  {
    key: "cutType",
    label: "Cut type",
    options: ["Curry Cut", "Biryani Cut", "Strips", "Keema / Mince", "Whole"],
  },
  {
    key: "bestFor",
    label: "Best suited for",
    options: ["Biryani", "Curry", "Fry", "Grill", "Kebab", "Soup / Stock"],
  },
  {
    key: "packSize",
    label: "Pack size",
    options: ["Under 500g", "500g – 1 kg", "Above 1 kg"],
  },
];

export function ProductGrid() {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState("chickenType");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        (p.hindiName && p.hindiName.includes(query)) ||
        p.idealFor.some((dish) => dish.toLowerCase().includes(query));

      const chickenTypes = selectedFilters.chickenType || [];
      const matchesChickenType =
        chickenTypes.length === 0 || chickenTypes.includes(p.chickenType);

      const boneTypes = selectedFilters.boneType || [];
      const matchesBoneType =
        boneTypes.length === 0 || boneTypes.includes(p.boneType);

      const cutTypes = selectedFilters.cutType || [];
      const matchesCutType =
        cutTypes.length === 0 || cutTypes.includes(p.cutType);

      const bestFors = selectedFilters.bestFor || [];
      const matchesBestFor =
        bestFors.length === 0 ||
        bestFors.some((bf) =>
          p.idealFor.some((ideal) => ideal.toLowerCase().includes(bf.toLowerCase()))
        );

      const packSizes = selectedFilters.packSize || [];
      const matchesPackSize =
        packSizes.length === 0 || packSizes.includes(p.packSizeGroup);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesChickenType &&
        matchesBoneType &&
        matchesCutType &&
        matchesBestFor &&
        matchesPackSize
      );
    }).sort((a, b) => b.reviewsCount - a.reviewsCount);
  }, [selectedCategory, searchQuery, selectedFilters]);

  const activeCategoryName =
    CATEGORIES.find((c) => c.id === selectedCategory)?.name || "All Fresh Cuts";

  const totalActiveFilters = Object.values(selectedFilters).flat().length;

  const toggleFilter = (section: string, value: string) => {
    setSelectedFilters((prev) => {
      const existing = prev[section] || [];
      return {
        ...prev,
        [section]: existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value],
      };
    });
  };

  const clearFilters = () => setSelectedFilters({});

  const activeSection = FILTER_SECTIONS.find((s) => s.key === activeFilterSection)!;

  return (
    <section id="cuts-catalog" className="bg-white min-h-[600px]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Left-aligned Filters button + anchored dropdown popover + items available count */}
        <div className="flex flex-col items-start gap-2.5 pb-5">
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                totalActiveFilters > 0 || isFilterOpen
                  ? "bg-[#D11243] text-white border-[#D11243]"
                  : "bg-white text-gray-800 border-gray-200 hover:border-gray-400 shadow-2xs"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {totalActiveFilters > 0 && (
                <span className="bg-white text-[#D11243] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalActiveFilters}
                </span>
              )}
            </button>

            {/* Anchored Filter Popover directly below Filters button */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute left-0 top-full mt-3 z-50 w-[330px] sm:w-[440px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 animate-in fade-in zoom-in-95 duration-150">
                  {/* Top pointer triangle */}
                  <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-gray-200/90 rotate-45" />

                  <div className="relative bg-white rounded-2xl overflow-hidden flex flex-col">
                    <div className="flex h-[280px]">
                      {/* Left filter section list */}
                      <div className="w-36 sm:w-44 shrink-0 border-r border-gray-100 overflow-y-auto py-2">
                        {FILTER_SECTIONS.map((section) => {
                          const count = (selectedFilters[section.key] || []).length;
                          const isActive = activeFilterSection === section.key;
                          return (
                            <button
                              key={section.key}
                              type="button"
                              onClick={() => setActiveFilterSection(section.key)}
                              className={`relative w-full text-left px-4 py-3 text-xs sm:text-sm font-bold transition-colors flex items-center justify-between cursor-pointer ${
                                isActive
                                  ? "text-[#D11243]"
                                  : "text-gray-700 hover:text-gray-950"
                              }`}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#D11243]" />
                              )}
                              <span>{section.label}</span>
                              {count > 0 && (
                                <span className="w-4 h-4 rounded-full bg-[#D11243] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right filter options */}
                      <div className="flex-1 overflow-y-auto px-5 py-4">
                        <div className="space-y-3.5">
                          {activeSection.options.map((opt) => {
                            const isChecked = (selectedFilters[activeSection.key] || []).includes(opt);
                            return (
                              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleFilter(activeSection.key, opt)}
                                  className="w-4 h-4 rounded border-gray-300 accent-[#D11243] cursor-pointer"
                                />
                                <span
                                  className={`text-xs sm:text-sm ${
                                    isChecked
                                      ? "text-[#D11243] font-bold"
                                      : "text-gray-800 font-medium group-hover:text-black"
                                  }`}
                                >
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="p-3.5 border-t border-gray-100 bg-white flex items-center gap-3">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-[#D11243] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-[#D11243] text-white text-xs sm:text-sm font-bold hover:bg-[#B00E37] transition-colors shadow-sm cursor-pointer"
                      >
                        View {filteredProducts.length} Items
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} available
          </p>
        </div>

        {/* Active search or filter chips */}
        {(searchQuery || totalActiveFilters > 0) && (
          <div className="flex flex-wrap items-center gap-2 pb-4">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FFF0F2] text-[#D11243] px-3 py-1 rounded-full border border-[#FFE2E6]">
                {searchQuery}
                <button onClick={() => setSearchQuery("")} className="cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {Object.entries(selectedFilters).flatMap(([sec, vals]) =>
              vals.map((val) => (
                <span
                  key={`${sec}-${val}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FFF0F2] text-[#D11243] px-3 py-1 rounded-full border border-[#FFE2E6]"
                >
                  {val}
                  <button onClick={() => toggleFilter(sec, val)} className="cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                clearFilters();
              }}
              className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Products Grid: 3 columns centered on desktop, 2 on tablet, 1 on small mobile */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#D11243] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Fresh Cuts Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try clearing active filters or selecting another fresh chicken category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                clearFilters();
              }}
              className="inline-flex items-center gap-2 bg-[#D11243] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#B00E37] transition-colors cursor-pointer"
            >
              View All 14 Fresh Cuts
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
