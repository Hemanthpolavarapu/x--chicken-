"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { OrderDTO } from "@x-chicken/shared";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, ApiClientError } from "@/lib/apiClient";
import { LocationModal } from "@/components/header/LocationModal";
import { InteractivePinMap } from "@/components/header/InteractivePinMap";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Zap,
  AlertCircle,
  Edit3,
  ShieldCheck,
} from "lucide-react";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    promoCode,
    appliedDiscount,
    clearCart,
    deliveryLocation,
    setDeliveryLocation,
    deliveryEligibility,
    isMounted,
  } = useCart();
  const { customer } = useAuth();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseFlat, setHouseFlat] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderDTO | null>(null);

  useEffect(() => {
    if (customer) {
      setRecipientName((prev) => prev || customer.name || "");
      setPhone((prev) => prev || customer.phone || "");
    }
  }, [customer]);

  useEffect(() => {
    if (deliveryLocation) {
      setStreetAddress(deliveryLocation.addressLine || "");
      setCity(deliveryLocation.city || "");
      setPincode(deliveryLocation.pincode || "");
    }
  }, [deliveryLocation]);

  const finalTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!customer) {
      setError("Please sign in to your customer account before confirming your order.");
      return;
    }
    if (!deliveryLocation || deliveryLocation.lat == null || deliveryLocation.lng == null) {
      setError("Please select your delivery location on the map before confirming your order.");
      setIsLocationModalOpen(true);
      return;
    }
    if (!recipientName.trim() || recipientName.trim().length < 2) {
      setError("Please enter a valid recipient name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    const combinedAddress = [houseFlat.trim(), streetAddress.trim()].filter(Boolean).join(", ");
    if (combinedAddress.length < 5) {
      setError("Please enter your complete house/flat number and street address.");
      return;
    }
    if (!city.trim() || city.trim().length < 2) {
      setError("Please enter your delivery city.");
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ order: OrderDTO }>("/api/v1/orders", {
        method: "POST",
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.selectedVariant?.id || item.product.variants?.[0]?.id || "default",
            quantity: item.quantity,
            cutPreference: item.selectedCutPreference,
          })),
          deliveryAddress: {
            label: "Home",
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            addressLine: combinedAddress,
            city: city.trim(),
            pincode: pincode.trim(),
            coordinates: {
              lat: deliveryLocation.lat,
              lng: deliveryLocation.lng,
            },
          },
          promoCode: appliedDiscount > 0 ? promoCode.trim().toUpperCase() : undefined,
          paymentMethod: "COD",
          customerNotes: customerNotes.trim() || undefined,
        }),
      });
      setPlacedOrder(res.order);
      clearCart();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setError("Your session expired. Please sign in again to place your order.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to confirm order.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <p className="text-sm font-semibold text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
              Order {placedOrder.orderNumber} Confirmed
            </span>
            <h1 className="text-2xl font-black text-gray-900">
              Dispatching to Nearest Fresh Store
            </h1>
            <p className="text-xs text-gray-500">
              Current status: <strong>{placedOrder.status.replace(/_/g, " ")}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Delivery Address</span>
              <span className="font-bold text-gray-900 text-right">
                {placedOrder.deliveryAddress.addressLine}, {placedOrder.deliveryAddress.city} -{" "}
                {placedOrder.deliveryAddress.pincode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-bold text-gray-900">Pay on Delivery (COD)</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-black text-sm">
              <span>Payable Amount</span>
              <span className="text-[#D11243]">₹{placedOrder.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 bg-[#D11243] hover:bg-[#B00E37] text-white font-bold py-3 rounded-xl text-xs text-center"
            >
              Track Live Order Status
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs text-center"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100"
              aria-label="Back to storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">Checkout</h1>
              <p className="text-xs text-gray-500">
                Verify delivery location, order summary and payment before confirming
              </p>
            </div>
          </div>

          {deliveryEligibility.checked && deliveryEligibility.express15MinEligible && (
            <span className="inline-flex items-center gap-1 bg-[#D11243] text-white font-bold px-3 py-1.5 rounded-full text-xs">
              <Zap className="w-3.5 h-3.5 fill-current" /> Express 15-min delivery
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-4">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-700">Your cart is currently empty.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl bg-[#D11243] text-white text-xs font-bold"
            >
              Browse Fresh Chicken Cuts
            </Link>
          </div>
        ) : (
          <form onSubmit={handleConfirmOrder} className="space-y-6">
            {/* 1. DELIVERY LOCATION */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#D11243] flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <div>
                    <h2 className="font-black text-base text-gray-900">Delivery Location</h2>
                    <p className="text-xs text-gray-500">
                      Orders are dispatched to the nearest eligible store from this pin
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#FFF0F2] hover:bg-[#FFE0E5] text-[#D11243] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{deliveryLocation ? "Change Pin / Location" : "Select Location"}</span>
                </button>
              </div>

              {deliveryLocation && deliveryLocation.lat != null && deliveryLocation.lng != null ? (
                <div className="space-y-3">
                  <InteractivePinMap
                    lat={deliveryLocation.lat}
                    lng={deliveryLocation.lng}
                    onChange={(coords) =>
                      setDeliveryLocation({
                        ...deliveryLocation,
                        lat: coords.lat,
                        lng: coords.lng,
                        source: "pin",
                      })
                    }
                    heightClass="h-44"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                      <MapPin className="w-4 h-4 text-[#D11243] shrink-0" />
                      <span>
                        Selected Pin: {deliveryLocation.lat.toFixed(5)},{" "}
                        {deliveryLocation.lng.toFixed(5)}
                      </span>
                    </span>
                    {deliveryEligibility.checked && (
                      <span
                        className={`font-bold ${
                          deliveryEligibility.express15MinEligible
                            ? "text-emerald-700"
                            : deliveryEligibility.eligible
                            ? "text-blue-700"
                            : "text-red-600"
                        }`}
                      >
                        {deliveryEligibility.express15MinEligible
                          ? `Express 15-min delivery (${deliveryEligibility.nearestDistanceKm} km)`
                          : deliveryEligibility.eligible
                          ? `Estimated ${deliveryEligibility.estimatedMins} mins (${deliveryEligibility.nearestDistanceKm} km)`
                          : "Outside current open store radius"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
                  <span>
                    No delivery pin selected yet. Please choose your location on the map so we can
                    dispatch to the nearest store.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#D11243] text-white font-bold shrink-0 cursor-pointer"
                  >
                    Pick Location
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Recipient Name *</label>
                  <input
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    House / Flat / Floor No.
                  </label>
                  <input
                    value={houseFlat}
                    onChange={(e) => setHouseFlat(e.target.value)}
                    placeholder="Flat 204, Sai Residency"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Street / Area Address *
                  </label>
                  <input
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street, Colony, Landmark"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City *</label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pincode *</label>
                  <input
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit pincode"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Cooking / Delivery Instructions (Optional)
                  </label>
                  <input
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Ring doorbell once, medium curry pieces"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D11243]"
                  />
                </div>
              </div>
            </section>

            {/* 2. ORDER SUMMARY */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#D11243] flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h2 className="font-black text-base text-gray-900">
                  Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map(({ product, quantity, selectedCutPreference, selectedVariant }) => {
                  const unitPrice = selectedVariant?.price ?? product.price;
                  const unitWeight = selectedVariant?.netWeight ?? product.netWeight;
                  return (
                    <div
                      key={`${product.id}-${selectedVariant?.id || "default"}`}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{product.name}</p>
                          <p className="text-gray-500">
                            {unitWeight} • {selectedCutPreference || "Store Master Cut"} • Qty{" "}
                            {quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900 shrink-0">
                        ₹{unitPrice * quantity}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? "FREE (₹0)" : `₹${deliveryFee}`}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Promo Discount ({promoCode.toUpperCase()})</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-200">
                  <span>Final Payable Amount</span>
                  <span className="text-[#D11243]">₹{finalTotal}</span>
                </div>
              </div>
            </section>

            {/* 3. PAYMENT METHOD */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#D11243] flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div>
                  <h2 className="font-black text-base text-gray-900">Payment Method</h2>
                  <p className="text-xs text-gray-500">
                    Supported payment option for live store dispatch
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-[#D11243] bg-[#FFF5F7] cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked
                  readOnly
                  className="mt-1 accent-[#D11243]"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 font-black text-gray-900">
                    <CreditCard className="w-4 h-4 text-[#D11243]" />
                    <span>Pay on Delivery (Cash / UPI at Doorstep)</span>
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    Pay directly upon fresh delivery. Orders are not marked paid prior to delivery.
                  </p>
                </div>
              </label>
            </section>

            {/* 4. ORDER CONFIRMATION */}
            <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-2xs">
              {!customer && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
                  <span>Please sign in to your Customer account to confirm this order.</span>
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg bg-[#D11243] text-white font-bold shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Final Payable Amount
                  </p>
                  <p className="text-2xl font-black text-[#D11243]">₹{finalTotal}</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-[#D11243]/25 cursor-pointer"
                >
                  {isSubmitting ? "Confirming Order..." : "Confirm Order"}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}
