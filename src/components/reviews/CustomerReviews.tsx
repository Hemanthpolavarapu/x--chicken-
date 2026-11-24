"use client";

import React from "react";
import { TESTIMONIALS } from "@/data/reviews";
import { Star, ShieldCheck, HeartHandshake, Quote } from "lucide-react";

export function CustomerReviews() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#D11243] text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5" />
            Real Customer Taste Tests
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Loved By Over <span className="text-[#D11243]">50,000+ Chicken Lovers</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            See why home cooks, biryani masters, and fitness enthusiasts switched from frozen meat apps to X-Chicken.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="bg-[#F8F9FB] rounded-2xl p-6 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating Stars & Verified */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Buyer
                  </span>
                </div>

                {/* Review Title */}
                <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
                  "{review.title}"
                </h4>

                {/* Review Comment */}
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Author & Cut Ordered */}
              <div className="pt-3 border-t border-gray-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{review.customerName}</span>
                  <span className="text-gray-400 text-[11px]">{review.reviewDate}</span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center justify-between">
                  <span>{review.locality}, {review.city}</span>
                </div>
                <div className="text-[10px] text-[#D11243] font-semibold truncate">
                  Cut: {review.cutPurchased}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
