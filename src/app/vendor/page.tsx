"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Phone,
  MapPin,
  Check,
  X,
  ChevronDown,
  ChefHat,
  CheckCircle2,
  Coins,
  ShoppingCart,
  User,
  ExternalLink,
  Flame,
  Menu,
  ArrowLeft,
  Store,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { INITIAL_VENDOR_ORDERS, VendorOrder } from "@/data/vendorData";

// Initial mock products for store management
const INITIAL_PRODUCTS = [
  { id: "prod-1", name: "Classic Fresh Curry Cut", category: "Curry Cuts", price: 159, unit: "500g", inStock: true, stockKg: 48 },
  { id: "prod-2", name: "Chicken Biryani Special Cut", category: "Biryani Special", price: 179, unit: "500g", inStock: true, stockKg: 35 },
  { id: "prod-3", name: "Tender Boneless Breast Fillet", category: "Boneless", price: 219, unit: "450g", inStock: true, stockKg: 28 },
  { id: "prod-4", name: "Plump Express Drumsticks", category: "Special", price: 189, unit: "500g", inStock: true, stockKg: 22 },
  { id: "prod-5", name: "Fine Minced Chicken Keema", category: "Keema", price: 199, unit: "450g", inStock: false, stockKg: 0 },
  { id: "prod-6", name: "Desi / Country Chicken (Naatu Kodi)", category: "Country Chicken", price: 289, unit: "500g", inStock: true, stockKg: 15 },
];

export default function VendorDashboardPage() {
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_VENDOR_ORDERS);
  const [activeTab, setActiveTab] = useState<"new" | "preparing" | "ready" | "completed">("new");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("ord-1025");
  const [activeNav, setActiveNav] = useState<"orders" | "products" | "stock" | "reports" | "settings">("orders");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Filter orders according to active tab
  const tabOrders = orders.filter((o) => {
    if (activeTab === "new") return o.status === "new";
    if (activeTab === "preparing") return o.status === "preparing";
    if (activeTab === "ready") return o.status === "ready";
    if (activeTab === "completed") return o.status === "completed";
    return true;
  });

  // Live metric counts
  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const completedCount = 18 + orders.filter((o) => o.status === "completed").length;

  // Selected Order
  const currentSelectedOrder =
    orders.find((o) => o.id === selectedOrderId) || tabOrders[0] || orders[0];

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsMobileDetailOpen(true);
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "preparing" } : o))
    );
    setActionNotice(`Order ${currentSelectedOrder.orderNumber} accepted! Moved to Preparing.`);
    // Pick next order if available
    const nextOrder = tabOrders.find((o) => o.id !== orderId);
    if (nextOrder) {
      setSelectedOrderId(nextOrder.id);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "rejected" } : o))
    );
    setActionNotice(`Order ${currentSelectedOrder.orderNumber} rejected.`);
    const nextOrder = tabOrders.find((o) => o.id !== orderId);
    if (nextOrder) {
      setSelectedOrderId(nextOrder.id);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "ready" } : o))
    );
    setActionNotice(`Order ${currentSelectedOrder.orderNumber} is Packed & Ready for Pickup!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMarkCompleted = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
    );
    setActionNotice(`Order ${currentSelectedOrder.orderNumber} dispatched & delivered!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const toggleProductStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const updateProductStockKg = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stockKg: Math.max(0, p.stockKg + delta), inStock: p.stockKg + delta > 0 } : p
      )
    );
  };

  // Reusable Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#630D20] text-white">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#630D20] shadow-sm">
              <Flame className="w-6 h-6 fill-[#D11243] text-[#D11243]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">X-Chicken</span>
              </div>
              <p className="text-[11px] font-semibold text-rose-200 uppercase tracking-wider">
                Vendor Panel
              </p>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3.5 space-y-1.5 text-sm">
          <button
            onClick={() => {
              setActiveNav("orders");
              setIsMobileMenuOpen(false);
              setIsMobileDetailOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-left cursor-pointer ${
              activeNav === "orders"
                ? "bg-[#85162D] text-white shadow-xs"
                : "text-rose-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Orders</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="bg-[#D11243] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("products");
              setIsMobileMenuOpen(false);
              setIsMobileDetailOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left cursor-pointer ${
              activeNav === "products"
                ? "bg-[#85162D] text-white shadow-xs"
                : "text-rose-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("stock");
              setIsMobileMenuOpen(false);
              setIsMobileDetailOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left cursor-pointer ${
              activeNav === "stock"
                ? "bg-[#85162D] text-white shadow-xs"
                : "text-rose-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("reports");
              setIsMobileMenuOpen(false);
              setIsMobileDetailOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left cursor-pointer ${
              activeNav === "reports"
                ? "bg-[#85162D] text-white shadow-xs"
                : "text-rose-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("settings");
              setIsMobileMenuOpen(false);
              setIsMobileDetailOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left cursor-pointer ${
              activeNav === "settings"
                ? "bg-[#85162D] text-white shadow-xs"
                : "text-rose-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-rose-200/90 hover:bg-white/10 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Sidebar Bottom: Store Status & Profile */}
      <div className="p-4 space-y-3 border-t border-white/10">
        <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>Store Status</span>
            <button
              type="button"
              onClick={() => setIsStoreOpen(!isStoreOpen)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isStoreOpen ? "bg-[#0E9F6E]" : "bg-gray-600"
              }`}
              role="switch"
              aria-checked={isStoreOpen}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isStoreOpen ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className={isStoreOpen ? "text-emerald-300" : "text-gray-400"}>
              {isStoreOpen ? "Open • Accepting Orders" : "Closed • Pause Incoming"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <h4 className="text-xs font-bold text-white">Chicken Store</h4>
              <p className="text-[11px] text-rose-200 font-medium">Vendor</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-rose-200" />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#F6F7F9] flex flex-col md:flex-row font-sans text-gray-900 selection:bg-[#D11243] selection:text-white pb-20 md:pb-6"
      suppressHydrationWarning
    >
      {/* MOBILE TOP BAR (App-like header on phones) */}
      <div className="md:hidden sticky top-0 z-30 bg-[#630D20] text-white px-3.5 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <Flame className="w-4 h-4 fill-[#D11243] text-[#D11243]" />
            </div>
            <span className="font-black text-sm tracking-tight">X-Chicken Vendor</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick store status toggle */}
          <button
            onClick={() => setIsStoreOpen(!isStoreOpen)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
              isStoreOpen
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/40"
                : "bg-red-500/25 text-red-300 border-red-400/40"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span>{isStoreOpen ? "Store Open" : "Closed"}</span>
          </button>

          <button
            onClick={() => {
              setActionNotice("No unread alerts");
              setTimeout(() => setActionNotice(null), 2500);
            }}
            className="relative p-1.5 rounded-full bg-white/10 text-white cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D11243]" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER SIDEBAR BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#630D20] shrink-0 min-h-screen sticky top-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-y-auto">
        {/* Top Greeting & Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              Good Evening, Chicken Store <span>👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              {activeNav === "orders" && "Manage your orders, products and store easily."}
              {activeNav === "products" && "Control your live butchery cuts and pricing."}
              {activeNav === "stock" && "Monitor fresh poultry stock and batch arrivals."}
              {activeNav === "reports" && "View today's revenue and performance metrics."}
              {activeNav === "settings" && "Configure store timings and operating preferences."}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                setActionNotice("All notifications caught up!");
                setTimeout(() => setActionNotice(null), 2500);
              }}
              className="relative w-10 h-10 rounded-full bg-white border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D11243] ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200/80 shadow-2xs text-xs font-bold text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Tue, Nov 24, 2026</span>
            </div>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 PASTEL STAT CARDS (2x2 on mobile, 4 in row on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: New Orders */}
          <div
            onClick={() => {
              setActiveNav("orders");
              setActiveTab("new");
              setIsMobileDetailOpen(false);
            }}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FFF0F2] border border-[#FFE2E6] flex items-center gap-2.5 sm:gap-3.5 shadow-2xs cursor-pointer hover:border-[#D11243]/30 transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFD5DC] flex items-center justify-center text-[#D11243] shrink-0">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-950 leading-tight">
                {newOrdersCount}
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 mt-0.5 truncate">New Orders</p>
            </div>
          </div>

          {/* Card 2: Preparing */}
          <div
            onClick={() => {
              setActiveNav("orders");
              setActiveTab("preparing");
              setIsMobileDetailOpen(false);
            }}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#FEF9E7] border border-[#FDE68A] flex items-center gap-2.5 sm:gap-3.5 shadow-2xs cursor-pointer hover:border-[#D97706]/30 transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-950 leading-tight">
                {preparingCount}
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 mt-0.5 truncate">Preparing</p>
            </div>
          </div>

          {/* Card 3: Completed Today */}
          <div
            onClick={() => {
              setActiveNav("orders");
              setActiveTab("completed");
              setIsMobileDetailOpen(false);
            }}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#EAFBF3] border border-[#A7F3D0] flex items-center gap-2.5 sm:gap-3.5 shadow-2xs cursor-pointer hover:border-[#0E9F6E]/30 transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#A7F3D0] flex items-center justify-center text-[#0E9F6E] shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-950 leading-tight">
                {completedCount}
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 mt-0.5 truncate">Completed</p>
            </div>
          </div>

          {/* Card 4: Today's Sales */}
          <div
            onClick={() => setActiveNav("reports")}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F4EFFE] border border-[#DDD6FE] flex items-center gap-2.5 sm:gap-3.5 shadow-2xs cursor-pointer hover:border-[#7C3AED]/30 transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shrink-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-gray-950 leading-tight">
                ₹4,850
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 mt-0.5 truncate">Today's Sales</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: ORDERS & DASHBOARD (Exact Match to User Reference) */}
        {activeNav === "orders" && (
          <div className="space-y-3 sm:space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab("new");
                  setIsMobileDetailOpen(false);
                }}
                className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "new"
                    ? "bg-[#8B1E38] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                New Orders ({newOrdersCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab("preparing");
                  setIsMobileDetailOpen(false);
                }}
                className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "preparing"
                    ? "bg-[#8B1E38] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Preparing ({preparingCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab("ready");
                  setIsMobileDetailOpen(false);
                }}
                className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "ready"
                    ? "bg-[#8B1E38] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Ready ({readyCount})
              </button>

              <button
                onClick={() => {
                  setActiveTab("completed");
                  setIsMobileDetailOpen(false);
                }}
                className={`px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "completed"
                    ? "bg-[#8B1E38] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Completed
              </button>
            </div>

            {/* MASTER-DETAIL RESPONSIVE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
              {/* ORDER CARDS LIST (Always visible on desktop; hidden on mobile when order detail is open) */}
              <div
                className={`lg:col-span-5 space-y-2.5 max-h-[660px] overflow-y-auto pr-0.5 ${
                  isMobileDetailOpen ? "hidden lg:block" : "block"
                }`}
              >
                {tabOrders.length > 0 ? (
                  tabOrders.map((order) => {
                    const isSelected = order.id === currentSelectedOrder?.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectOrder(order.id)}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer text-left active:scale-99 ${
                          isSelected
                            ? "bg-[#FFF5F6] border-[#E21B4B] shadow-xs ring-1 ring-[#E21B4B]/20"
                            : "bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black text-sm ${
                                isSelected ? "text-[#D11243]" : "text-gray-900"
                              }`}
                            >
                              {order.orderNumber}
                            </span>
                            <span className="bg-[#D11243] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              {order.status === "new" ? "New" : order.status}
                            </span>
                          </div>
                          <span className="font-black text-sm text-gray-950">
                            ₹{order.totalAmount}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span className="text-gray-700 font-semibold truncate max-w-[65%]">
                            {order.customerName}
                          </span>
                          <span className="text-gray-400">{order.time}</span>
                        </div>

                        {/* Mobile tap cue */}
                        <div className="lg:hidden mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#D11243] font-bold">
                          <span>{order.items.length} cut items</span>
                          <span>Tap to View Details →</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-2">
                    <ChefHat className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-xs font-bold text-gray-700">No {activeTab} orders at the moment</p>
                    <p className="text-[11px] text-gray-400">Incoming store orders will appear here automatically.</p>
                  </div>
                )}
              </div>

              {/* ORDER DETAIL PANE (Visible on desktop; or when an order is tapped on mobile) */}
              <div
                className={`lg:col-span-7 ${
                  isMobileDetailOpen ? "block" : "hidden lg:block"
                }`}
              >
                {currentSelectedOrder ? (
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                    {/* Mobile Back Button (Only on small screens) */}
                    <div className="lg:hidden pb-1 border-b border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => setIsMobileDetailOpen(false)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#D11243] cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Orders List</span>
                      </button>
                      <span className="text-[10px] font-black uppercase text-gray-400">
                        Order Details
                      </span>
                    </div>

                    {/* Order Details Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-gray-950">
                            Order {currentSelectedOrder.orderNumber}
                          </h2>
                          <span className="bg-[#D11243] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {currentSelectedOrder.status === "new" ? "New" : currentSelectedOrder.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Placed at {currentSelectedOrder.time}, {currentSelectedOrder.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span>Payment:</span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold px-2 py-0.5 rounded-md">
                          {currentSelectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Customer Information Box */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gray-50/80 border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 text-xs">
                      {/* Customer */}
                      <div className="md:col-span-4 flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium block">Customer</span>
                          <span className="font-bold text-gray-900 text-sm">
                            {currentSelectedOrder.customerName}
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="md:col-span-4 flex items-start justify-between gap-2 border-t md:border-t-0 md:border-l border-gray-200/70 pt-2.5 md:pt-0 md:pl-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium block">Phone</span>
                            <span className="font-bold text-gray-900">
                              {currentSelectedOrder.phone}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`tel:${currentSelectedOrder.phone}`}
                          className="w-8 h-8 rounded-full bg-[#FFF0F2] text-[#D11243] flex items-center justify-center hover:bg-[#D11243] hover:text-white transition-colors shrink-0"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Address */}
                      <div className="md:col-span-4 flex items-start gap-2.5 border-t md:border-t-0 md:border-l border-gray-200/70 pt-2.5 md:pt-0 md:pl-4">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-gray-400 font-medium block">Delivery Address</span>
                          <span className="font-semibold text-gray-800 leading-tight block">
                            {currentSelectedOrder.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="font-black text-xs sm:text-sm text-gray-900 uppercase tracking-wider">
                        Order Items
                      </h3>
                      <div className="divide-y divide-gray-100">
                        {currentSelectedOrder.items.map((item) => (
                          <div key={item.id} className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                              />
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-gray-900">{item.name}</h4>
                                <p className="text-[11px] text-gray-500">{item.customization}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-8">
                              <span className="text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">
                                {item.quantity}
                              </span>
                              <span className="text-xs sm:text-sm font-black text-gray-950 min-w-[45px] text-right">
                                ₹{item.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Amount Strip */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-[#FFF0F2] border border-[#FFE2E6] flex items-center justify-between text-gray-900">
                      <span className="font-bold text-xs sm:text-sm text-gray-800">Total Amount</span>
                      <span className="font-black text-lg sm:text-xl text-gray-950">
                        ₹{currentSelectedOrder.totalAmount}
                      </span>
                    </div>

                    {/* Action Buttons (Inline on desktop & tablet) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
                      {currentSelectedOrder.status === "new" ? (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(currentSelectedOrder.id)}
                            className="w-full sm:flex-1 bg-[#0D7A3E] hover:bg-[#0B6634] text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Accept Order</span>
                          </button>
                          <button
                            onClick={() => handleRejectOrder(currentSelectedOrder.id)}
                            className="w-full sm:flex-1 bg-white hover:bg-rose-50 text-[#D11243] border border-rose-300 font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : currentSelectedOrder.status === "preparing" ? (
                        <button
                          onClick={() => handleMarkReady(currentSelectedOrder.id)}
                          className="w-full bg-[#FF7A00] hover:bg-[#E06000] text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Meat Cut & Packed • Mark Ready</span>
                        </button>
                      ) : currentSelectedOrder.status === "ready" ? (
                        <button
                          onClick={() => handleMarkCompleted(currentSelectedOrder.id)}
                          className="w-full bg-[#0E9F6E] hover:bg-[#0B7A3E] text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Handed to Delivery Partner • Complete</span>
                        </button>
                      ) : (
                        <div className="w-full p-2.5 rounded-xl bg-gray-100 text-center text-xs font-bold text-gray-500">
                          This order is {currentSelectedOrder.status}.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center text-gray-400">
                    Select an order from the list to view customer details and items.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCTS CATALOG MANAGEMENT */}
        {activeNav === "products" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-black text-gray-900">Store Cuts & Inventory Toggle</h2>
                  <p className="text-xs text-gray-500">Toggle product availability in real-time for customer orders.</p>
                </div>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                  {products.filter((p) => p.inStock).length} of {products.length} In Stock
                </span>
              </div>

              <div className="divide-y divide-gray-100 mt-2">
                {products.map((prod) => (
                  <div key={prod.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900">{prod.name}</h4>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ₹{prod.price} / {prod.unit} • Live Reserve: {prod.stockKg} kg
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          prod.inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {prod.inStock ? "Available" : "Sold Out"}
                      </span>
                      <button
                        onClick={() => toggleProductStock(prod.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          prod.inStock
                            ? "bg-rose-50 hover:bg-rose-100 text-[#D11243]"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {prod.inStock ? "Mark Out of Stock" : "Mark Available"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: STOCK & LIVE POULTRY */}
        {activeNav === "stock" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs">
              <h2 className="text-lg font-black text-gray-900 pb-1">Today's Live Poultry & Cuts Reserve</h2>
              <p className="text-xs text-gray-500 pb-4 border-b border-gray-100">
                Fresh morning batch arrival from bio-secure farms. Chill chain 0°C - 4°C.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {products.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-[#D11243]">{p.category}</span>
                      <h4 className="font-bold text-sm text-gray-900 mt-0.5">{p.name}</h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between">
                      <span className="font-black text-xl text-gray-950">{p.stockKg} kg</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateProductStockKg(p.id, -2)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer font-bold"
                          title="Decrease 2kg"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateProductStockKg(p.id, 5)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100 cursor-pointer font-bold"
                          title="Add 5kg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: REPORTS & ANALYTICS */}
        {activeNav === "reports" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-gray-900">Today's Store Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold">Average Butchering Time</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">7.4 mins</div>
                  <span className="text-[11px] text-emerald-600 font-bold">⚡ 2.6m faster than target</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold">Average Order Value</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">₹378</div>
                  <span className="text-[11px] text-gray-500 font-medium">Across 26 orders</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs text-gray-500 font-semibold">Customer Freshness Rating</span>
                  <div className="text-2xl font-black text-gray-900 mt-1">4.92 / 5.0</div>
                  <span className="text-[11px] text-amber-600 font-bold">★ 100% Zero Frozen Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: STORE SETTINGS */}
        {activeNav === "settings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-black text-gray-900">Store Configuration</h2>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Store Hub Hours</h4>
                    <p className="text-xs text-gray-500">6:00 AM – 10:00 PM (Everyday)</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    Active
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Butchery Cutting Stations</h4>
                    <p className="text-xs text-gray-500">3 Master Butchers on Duty Today</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    Full Capacity
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 gap-2">
                  <div>
                    <h4 className="font-bold text-gray-900">Express Delivery Radius</h4>
                    <p className="text-xs text-gray-500">5.5 km store perimeter (15-min delivery promise)</p>
                  </div>
                  <span className="text-xs font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    Optimized
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM ACTION BAR (When viewing order detail on mobile, so vendor can accept immediately) */}
      {isMobileDetailOpen && activeNav === "orders" && currentSelectedOrder && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-2xl flex items-center gap-2">
          {currentSelectedOrder.status === "new" ? (
            <>
              <button
                onClick={() => handleAcceptOrder(currentSelectedOrder.id)}
                className="flex-1 bg-[#0D7A3E] active:bg-[#0B6634] text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Accept Order (₹{currentSelectedOrder.totalAmount})</span>
              </button>
              <button
                onClick={() => handleRejectOrder(currentSelectedOrder.id)}
                className="bg-white active:bg-rose-50 text-[#D11243] border border-rose-300 font-bold py-3 px-3.5 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Reject</span>
              </button>
            </>
          ) : currentSelectedOrder.status === "preparing" ? (
            <button
              onClick={() => handleMarkReady(currentSelectedOrder.id)}
              className="w-full bg-[#FF7A00] text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              <span>Mark Ready for Pickup</span>
            </button>
          ) : currentSelectedOrder.status === "ready" ? (
            <button
              onClick={() => handleMarkCompleted(currentSelectedOrder.id)}
              className="w-full bg-[#0E9F6E] text-white font-black py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Dispatch & Complete</span>
            </button>
          ) : (
            <button
              onClick={() => setIsMobileDetailOpen(false)}
              className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl text-xs"
            >
              Back to Orders List
            </button>
          )}
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Like Swiggy Partner / Zomato Merchant app) */}
      {!isMobileDetailOpen && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => {
              setActiveNav("orders");
              setIsMobileDetailOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors relative ${
              activeNav === "orders" ? "text-[#D11243]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Orders</span>
            {newOrdersCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#D11243] text-white text-[9px] font-black flex items-center justify-center">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("products");
              setIsMobileDetailOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              activeNav === "products" ? "text-[#D11243]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("stock");
              setIsMobileDetailOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              activeNav === "stock" ? "text-[#D11243]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Boxes className="w-5 h-5" />
            <span>Stock</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("reports");
              setIsMobileDetailOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              activeNav === "reports" ? "text-[#D11243]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Reports</span>
          </button>

          <button
            onClick={() => {
              setActiveNav("settings");
              setIsMobileDetailOpen(false);
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
              activeNav === "settings" ? "text-[#D11243]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}
