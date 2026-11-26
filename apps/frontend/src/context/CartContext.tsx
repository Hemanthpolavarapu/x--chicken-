"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, CartItem, ProductVariant } from "@/types";
import { apiRequest } from "@/lib/apiClient";

export interface DeliveryLocationState {
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  source: "gps" | "pin" | "manual";
}

export interface DeliveryEligibilityState {
  checked: boolean;
  loading: boolean;
  eligible: boolean;
  express15MinEligible: boolean;
  nearestDistanceKm: number | null;
  nearestStoreName: string | null;
  estimatedMins: number | null;
}

const DEFAULT_ELIGIBILITY: DeliveryEligibilityState = {
  checked: false,
  loading: false,
  eligible: false,
  express15MinEligible: false,
  nearestDistanceKm: null,
  nearestStoreName: null,
  estimatedMins: null,
};

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, cutPreference?: string, variant?: ProductVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, delta: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  deliveryLocation: DeliveryLocationState | null;
  setDeliveryLocation: (loc: DeliveryLocationState | null) => void;
  deliveryEligibility: DeliveryEligibilityState;
  refreshEligibility: (lat: number, lng: number) => Promise<void>;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedPincode: string;
  setSelectedPincode: (pin: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const matchesCartItem = (item: CartItem, productId: string, variantId?: string) => {
  if (item.product.id !== productId) return false;
  if (!variantId) return true;
  return (item.selectedVariant?.id || item.product.variants[0]?.id) === variantId;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocationState] = useState<DeliveryLocationState | null>(null);
  const [deliveryEligibility, setDeliveryEligibility] =
    useState<DeliveryEligibilityState>(DEFAULT_ELIGIBILITY);
  const [promoCode, setPromoCodeState] = useState("");
  const [appliedDiscount, setAppliedDiscountState] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const refreshEligibility = useCallback(async (lat: number, lng: number) => {
    setDeliveryEligibility((prev) => ({ ...prev, loading: true }));
    try {
      const res = await apiRequest<{
        eligible: boolean;
        express15MinEligible: boolean;
        nearestDistanceKm: number | null;
        nearestStoreName: string | null;
        estimatedMins: number | null;
      }>(`/api/v1/delivery/eligibility?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
      setDeliveryEligibility({
        checked: true,
        loading: false,
        eligible: res.eligible,
        express15MinEligible: res.express15MinEligible,
        nearestDistanceKm: res.nearestDistanceKm,
        nearestStoreName: res.nearestStoreName,
        estimatedMins: res.estimatedMins,
      });
    } catch {
      setDeliveryEligibility({
        ...DEFAULT_ELIGIBILITY,
        checked: true,
        loading: false,
      });
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem("xchicken_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedDelivery = localStorage.getItem("xchicken_delivery_location");
      if (savedDelivery) {
        const parsed = JSON.parse(savedDelivery) as DeliveryLocationState;
        setDeliveryLocationState(parsed);
        if (typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          refreshEligibility(parsed.lat, parsed.lng);
        }
      }
      const savedPromo = sessionStorage.getItem("xchicken_promo");
      if (savedPromo) {
        const parsed = JSON.parse(savedPromo) as { code: string; discount: number };
        setPromoCodeState(parsed.code || "");
        setAppliedDiscountState(parsed.discount || 0);
      }
    } catch {
      // ignore SSR or storage restrictions
    }
  }, [refreshEligibility]);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("xchicken_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const setDeliveryLocation = useCallback(
    (loc: DeliveryLocationState | null) => {
      setDeliveryLocationState(loc);
      try {
        if (loc) {
          localStorage.setItem("xchicken_delivery_location", JSON.stringify(loc));
        } else {
          localStorage.removeItem("xchicken_delivery_location");
        }
      } catch {
        // ignore
      }
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        refreshEligibility(loc.lat, loc.lng);
      } else {
        setDeliveryEligibility(DEFAULT_ELIGIBILITY);
      }
    },
    [refreshEligibility]
  );

  const setPromoCode = (code: string) => {
    setPromoCodeState(code);
    try {
      sessionStorage.setItem(
        "xchicken_promo",
        JSON.stringify({ code, discount: appliedDiscount })
      );
    } catch {}
  };

  const setAppliedDiscount = (discount: number) => {
    setAppliedDiscountState(discount);
    try {
      sessionStorage.setItem(
        "xchicken_promo",
        JSON.stringify({ code: promoCode, discount })
      );
    } catch {}
  };

  const addItem = (
    product: Product,
    cutPreference?: string,
    variant?: ProductVariant
  ) => {
    const chosenVariant = variant || product.variants[0];
    const variantId = chosenVariant?.id;

    setItems((prev) => {
      const existing = prev.find((item) =>
        matchesCartItem(item, product.id, variantId)
      );
      if (existing) {
        return prev.map((item) =>
          matchesCartItem(item, product.id, variantId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedCutPreference: cutPreference || "Store Master Cut (Fresh Today)",
          selectedVariant: chosenVariant,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((item) => !matchesCartItem(item, productId, variantId))
    );
  };

  const updateQuantity = (
    productId: string,
    delta: number,
    variantId?: string
  ) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (matchesCartItem(item, productId, variantId)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    setPromoCodeState("");
    setAppliedDiscountState(0);
    try {
      sessionStorage.removeItem("xchicken_promo");
    } catch {}
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.selectedVariant?.price ?? item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);

  const freeDeliveryThreshold = 299;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 29;
  const amountNeededForFreeDelivery = Math.max(
    0,
    freeDeliveryThreshold - subtotal
  );

  const selectedLocation = deliveryLocation
    ? deliveryLocation.area || deliveryLocation.addressLine || deliveryLocation.city
    : "";
  const selectedPincode = deliveryLocation?.pincode || "";

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        promoCode,
        setPromoCode,
        appliedDiscount,
        setAppliedDiscount,
        isCartOpen,
        setIsCartOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        deliveryLocation,
        setDeliveryLocation,
        deliveryEligibility,
        refreshEligibility,
        selectedLocation,
        setSelectedLocation: (loc: string) => {
          setDeliveryLocation({
            addressLine: loc,
            area: loc,
            city: deliveryLocation?.city || "",
            pincode: deliveryLocation?.pincode || "",
            lat: deliveryLocation?.lat ?? null,
            lng: deliveryLocation?.lng ?? null,
            source: "manual",
          });
        },
        selectedPincode,
        setSelectedPincode: (pin: string) => {
          if (!deliveryLocation) return;
          setDeliveryLocation({ ...deliveryLocation, pincode: pin });
        },
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        quickViewProduct,
        setQuickViewProduct,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
