"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Clock,
  CheckCircle,
} from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useCart } from "@/context/CartContext";

export function Footer() {
  const { setSelectedCategory } = useCart();

  return (
    <footer className="bg-[#1C1E21] text-gray-300 pt-12 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white px-3.5 py-2 rounded-xl shadow-xs">
              <img
                src="/images/logo.png"
                alt="Chiken Fresh Meat"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Chiken Fresh Meat specializes purely in fresh chicken, eliminating old warehouse
              freezers and delivering precision-cut poultry from your neighborhood butchery in
              under 15 minutes.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>FSSAI Lic. 11223344556677</span>
              </div>
            </div>
          </div>

          {/* Fresh Chicken Cuts (exact names from category navigation) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Fresh Chicken Cuts
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <a
                    href="#cuts-catalog"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span className="text-white font-semibold">1800-CHIKEN-FRESH</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>fresh@chiken.com</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <span>Store Hub Hours: 6:00 AM – 10:30 PM (7 Days a week)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Chiken Fresh Meat Pvt. Ltd. All rights reserved. 100% Fresh Poultry Guarantee.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
