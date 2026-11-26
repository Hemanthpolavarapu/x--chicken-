"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, ProductVariant } from "@/types";

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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
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
  const [selectedLocation, setSelectedLocation] = useState("Indiranagar, Bangalore");
  const [selectedPincode, setSelectedPincode] = useState("560038");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem("xchicken_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedLoc = localStorage.getItem("xchicken_location");
      if (savedLoc) {
        setSelectedLocation(savedLoc);
      }
    } catch {
      // ignore SSR or storage restrictions
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("xchicken_cart", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

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
        isCartOpen,
        setIsCartOpen,
        selectedLocation,
        setSelectedLocation: (loc: string) => {
          setSelectedLocation(loc);
          try {
            localStorage.setItem("xchicken_location", loc);
          } catch {}
        },
        selectedPincode,
        setSelectedPincode,
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
