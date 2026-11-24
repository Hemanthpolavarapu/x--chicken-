"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { ProductCard } from "./ProductCard";
import { Sparkles, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export function ProductGrid() {
  const { selectedCategory, searchQuery, setSearchQuery, setSelectedCategory } = useCart();
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "rating">("popular");

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query) ||
        (p.hindiName && p.hindiName.includes(query)) ||
        p.idealFor.some((dish) => dish.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // popular
    });
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategoryName =
    CATEGORIES.find((c) => c.id === selectedCategory)?.name || "All Fresh Cuts";

  return (
    <section id="cuts-catalog" className="py-12 bg-[#F8F9FB] min-h-[600px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 gap-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategoryName}
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-xs">
                {filteredProducts.length} Cuts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Guaranteed cut fresh today in sanitized neighborhood store • Zero frozen inventory
            </p>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span>Sort:</span>
              <select
                suppressHydrationWarning
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="popular">Bestselling First</option>
                <option value="rating">Highest Rated (★ 4.9)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips (if search is active) */}
        {searchQuery && (
          <div className="flex items-center gap-2 pt-4">
            <span className="text-xs text-gray-500">Filtered by keyword:</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FFF0F2] text-[#D11243] px-3 py-1 rounded-full border border-[#FFE2E6]">
              {searchQuery}
              <button
                onClick={() => setSearchQuery("")}
                className="hover:text-red-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs text-gray-500 hover:text-gray-900 underline ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-5 sm:pt-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 mt-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#D11243] flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Fresh Cuts Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              We couldn't find any chicken cut matching "{searchQuery}". Try searching for
              "Curry cut", "Biryani cut", "Boneless", or "Keema".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="inline-flex items-center gap-2 bg-[#D11243] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#B00E37] transition-colors cursor-pointer"
            >
              View All 12 Fresh Cuts
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
