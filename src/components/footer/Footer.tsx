"use client";

import React from "react";
import {
  Flame,
  Phone,
  Mail,
  Clock,
  CheckCircle,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1C1E21] text-gray-300 pt-12 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#D11243] to-[#FF7A00] flex items-center justify-center text-white font-black shadow-md">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                X<span className="text-[#D11243]">-CHICKEN</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              X-Chicken is revolutionizing poultry retail. &ldquo;X&rdquo; stands for Express Store Delivery.
              We specialize purely in fresh chicken, eliminating old warehouse freezers and
              delivering precision-cut poultry from your neighborhood butchery in under 15 minutes.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>FSSAI Lic. 11223344556677</span>
              </div>
            </div>
          </div>

          {/* Cuts & Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Fresh Chicken Cuts
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Curry Cut (Skinless)</a></li>
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Master Biryani Cut</a></li>
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Boneless Breast Fillets</a></li>
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Chicken Keema / Mince</a></li>
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Party Chicken Lollipops</a></li>
              <li><a href="#cuts-catalog" className="hover:text-white transition-colors">Desi Country Chicken</a></li>
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
                <span className="text-white font-semibold">1800-X-CHICKEN</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>fresh@xchicken.com</span>
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
          <p>© 2026 X-Chicken Pvt. Ltd. All rights reserved. 100% Fresh Poultry Guarantee.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
