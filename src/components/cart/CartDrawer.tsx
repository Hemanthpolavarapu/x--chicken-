"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    selectedLocation,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "EXPRESS50") {
      if (subtotal >= 200) {
        setAppliedDiscount(50);
        setPromoMessage({ text: "Promo EXPRESS50 applied! ₹50 saved.", error: false });
      } else {
        setPromoMessage({ text: "Cart total must be at least ₹200 for EXPRESS50.", error: true });
      }
    } else if (promoCode.trim().toUpperCase() === "FRESH10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoMessage({ text: `Promo FRESH10 applied! ₹${discount} saved.`, error: false });
    } else {
      setPromoMessage({ text: "Invalid code. Try 'EXPRESS50' or 'FRESH10'", error: true });
    }
  };

  const finalTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  const handleCheckout = () => {
    setIsOrderPlaced(true);
  };

  const handleCloseAndReset = () => {
    setIsOrderPlaced(false);
    clearCart();
    setIsCartOpen(false);
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
                <span className="text-[#D11243]">{Math.round((subtotal / freeDeliveryThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#FFE2E6]">
                <div
                  className="bg-[#D11243] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🎉 Congratulations! You have unlocked FREE Express Delivery</span>
            </div>
          )}
        </div>

        {/* Cart Contents */}
        {isOrderPlaced ? (
          // Order Placed Simulation State
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Order #XC-{Math.floor(100000 + Math.random() * 900000)} Placed
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Fresh Chicken Butchery In Progress!
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Your neighborhood hub store butcher is currently cutting your order fresh from today's morning batch.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 w-full text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivering to:</span>
                <span className="font-bold text-gray-800 truncate max-w-[180px]">{selectedLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Arrival:</span>
                <span className="font-bold text-[#D11243] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" /> 28-35 mins
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment:</span>
                <span className="font-bold text-gray-800">Pay on Delivery (UPI / Cash)</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-sm">
                <span>Amount Payable:</span>
                <span className="text-[#D11243]">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Order More Fresh Chicken
            </button>
          </div>
        ) : items.length === 0 ? (
          // Empty state
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
          // List of items
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
                    <span className="font-black text-xs text-gray-900">
                      ₹{unitPrice * quantity}
                    </span>
                    <span className="text-[10px] text-gray-400 line-through">
                      ₹{unitOrigPrice * quantity}
                    </span>
                  </div>
                </div>

                {/* Quantity stepper */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      onClick={() => updateQuantity(product.id, -1, variantId)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1, variantId)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-700 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id, variantId)}
                    className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
        {!isOrderPlaced && items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 space-y-3">
            {/* Bill Summary */}
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
                <span>Insulated Chill Packing</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-[#D11243]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="w-full bg-[#D11243] hover:bg-[#B00E37] text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-[#D11243]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Proceed to Express Checkout (₹{finalTotal})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
