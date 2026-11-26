"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
} from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    promoCode,
    setPromoCode,
    appliedDiscount,
    setAppliedDiscount,
  } = useCart();

  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = promoCode.trim().toUpperCase();
    if (normalized === "EXPRESS50") {
      if (subtotal >= 200) {
        setAppliedDiscount(50);
        setPromoMessage({ text: "Promo EXPRESS50 applied! ₹50 saved.", error: false });
      } else {
        setAppliedDiscount(0);
        setPromoMessage({ text: "Cart total must be at least ₹200 for EXPRESS50.", error: true });
      }
    } else if (normalized === "FRESH10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoMessage({ text: `Promo FRESH10 applied! ₹${discount} saved.`, error: false });
    } else {
      setAppliedDiscount(0);
      setPromoMessage({ text: "Invalid code. Try 'EXPRESS50' or 'FRESH10'", error: true });
    }
  };

  const finalTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] flex items-center justify-center text-[#D11243]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Express Store Cart</h3>
              <p className="text-xs text-gray-500">
                {items.length} {items.length === 1 ? "Item" : "Items"} selected
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="p-3.5 bg-[#FFF0F2] border-b border-[#FFE2E6] text-xs">
          {amountNeededForFreeDelivery > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Add ₹{amountNeededForFreeDelivery} more for FREE Express Delivery</span>
                <span className="text-[#D11243]">₹{freeDeliveryThreshold} min</span>
              </div>
              <div className="w-full h-1.5 bg-[#FFD5DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D11243] transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Congratulations! You unlocked FREE Express Store Delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-800 text-base">Your Cart is Empty</h4>
              <p className="text-xs text-gray-500 max-w-xs">
                Explore our store-fresh, cut-to-order poultry cuts. Remember, zero frozen meat!
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="bg-[#D11243] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-[#B00E37] cursor-pointer"
            >
              Explore Fresh Cuts
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map(({ product, quantity, selectedCutPreference, selectedVariant }) => {
              const unitPrice = selectedVariant?.price ?? product.price;
              const unitOrigPrice = selectedVariant?.originalPrice ?? product.originalPrice;
              const unitWeight = selectedVariant?.netWeight ?? product.netWeight;
              const variantId = selectedVariant?.id;

              return (
                <div
                  key={`${product.id}-${variantId || "default"}`}
                  className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex gap-3 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{product.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Net: {unitWeight} • {selectedCutPreference || "Store Master Cut"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-sm text-gray-900">
                        ₹{unitPrice * quantity}
                      </span>
                      <span className="text-[11px] text-gray-400 line-through">
                        ₹{unitOrigPrice * quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(product.id, variantId)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-[#F9C4CE] bg-[#FFF0F2] rounded-lg">
                      <button
                        onClick={() => updateQuantity(product.id, -1, variantId)}
                        className="p-1 text-[#D11243] hover:bg-[#FFE2E6] rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-extrabold text-[#D11243]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1, variantId)}
                        className="p-1 text-[#D11243] hover:bg-[#FFE2E6] rounded-r-lg cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Promo Code Input */}
            <div className="pt-2">
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      suppressHydrationWarning
                      type="text"
                      placeholder="Enter promo (e.g. EXPRESS50)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                    />
                  </div>
                  <button
                    suppressHydrationWarning
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      promoMessage.error ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {promoMessage.text}
                  </p>
                )}
              </form>
            </div>

            {/* Store Hub Guarantee strip */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero Frozen Guarantee</span>
                <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">
                  Cut and packed in insulated chilled packaging. Never pre-frozen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Bar */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  Express Store Delivery
                  {deliveryFee === 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">
                      FREE
                    </span>
                  )}
                </span>
                <span>{deliveryFee === 0 ? "₹0" : `₹${deliveryFee}`}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount</span>
                  <span>-₹{appliedDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Insulated Chill Packing
                </span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-[#D11243]">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#D11243] hover:bg-[#B00E37] text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-[#D11243]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Proceed to Checkout (₹{finalTotal})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
