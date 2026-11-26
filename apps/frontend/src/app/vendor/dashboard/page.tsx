"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AuthUser,
  NotificationDTO,
  StoreDTO,
  VendorDTO,
  VendorOfferDTO,
  VendorOrderDTO,
} from "@x-chicken/shared";
import { apiRequest, getApiBaseUrl } from "@/lib/apiClient";
import { PRODUCTS } from "@/data/products";
import {
  LayoutDashboard,
  Package,
  Boxes,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Check,
  X,
  ChefHat,
  CheckCircle2,
  Coins,
  ShoppingCart,
  Flame,
  Menu,
  LogOut,
  Power,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface VendorOrdersResponse {
  incomingOffers: VendorOfferDTO[];
  activeOrders: VendorOrderDTO[];
  completedOrders: VendorOrderDTO[];
  metrics: {
    incomingCount: number;
    activeCount: number;
    deliveredCount: number;
    totalRevenue: number;
  };
}

interface InventoryItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  category: string;
  variantLabel: string;
  basePrice: number;
  priceOverride?: number;
  stockQty: number;
  reservedQty: number;
  isAvailable: boolean;
}

type SidebarNav = "orders" | "products" | "stock" | "reports" | "settings";
type OrderTab = "new" | "preparing" | "ready" | "completed";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [vendor, setVendor] = useState<VendorDTO | null>(null);
  const [store, setStore] = useState<StoreDTO | null>(null);
  const [ordersData, setOrdersData] = useState<VendorOrdersResponse | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeNav, setActiveNav] = useState<SidebarNav>("orders");
  const [activeTab, setActiveTab] = useState<OrderTab>("new");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const productImages = useMemo(
    () => new Map(PRODUCTS.map((p) => [p.id, p.image])),
    []
  );

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    addressLine: "",
    city: "",
    pincode: "",
    lat: "",
    lng: "",
    serviceRadiusKm: "10",
    openingTime: "07:00",
    closingTime: "22:00",
    maxConcurrentOrders: "10",
    autoAcceptTimeoutSec: "60",
  });

  const showNotice = (text: string, error = false) => {
    setNotice({ text, error });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const me = await apiRequest<{ user: AuthUser; vendor: VendorDTO; store: StoreDTO }>(
        "/api/v1/vendor/auth/me"
      );
      setUser(me.user);
      setVendor(me.vendor);
      setStore(me.store);
      setStoreForm({
        storeName: me.store.storeName,
        addressLine: me.store.addressLine,
        city: me.store.city,
        pincode: me.store.pincode,
        lat: String(me.store.coordinates.lat),
        lng: String(me.store.coordinates.lng),
        serviceRadiusKm: String(me.store.serviceRadiusKm),
        openingTime: me.store.openingTime,
        closingTime: me.store.closingTime,
        maxConcurrentOrders: String(me.store.maxConcurrentOrders),
        autoAcceptTimeoutSec: String(me.store.autoAcceptTimeoutSec),
      });

      const [ordRes, invRes, notifRes] = await Promise.all([
        apiRequest<VendorOrdersResponse>("/api/v1/vendor/orders"),
        apiRequest<{ items: InventoryItem[] }>("/api/v1/vendor/inventory"),
        apiRequest<{ notifications: NotificationDTO[]; unreadCount: number }>(
          "/api/v1/vendor/notifications"
        ),
      ]);

      setOrdersData(ordRes);
      setInventory(invRes.items);
      setNotifications(notifRes.notifications);
      setUnreadCount(notifRes.unreadCount);
      setLoading(false);
    } catch {
      router.replace("/vendor/login");
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const pollTimer = setInterval(() => {
      loadDashboardData();
    }, 5000);
    const streamUrl = `${getApiBaseUrl()}/api/v1/vendor/notifications/stream`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.addEventListener("notification", (event) => {
      try {
        const notif = JSON.parse((event as MessageEvent).data) as NotificationDTO;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });
        setUnreadCount((c) => c + 1);
        loadDashboardData();
      } catch {
        // ignore parse errors
      }
    });

    return () => {
      clearInterval(pollTimer);
      eventSource.close();
    };
  }, [user, loadDashboardData]);

  const preparingOrders = useMemo(
    () =>
      (ordersData?.activeOrders ?? []).filter(
        (o) => o.status === "ASSIGNED" || o.status === "PREPARING"
      ),
    [ordersData]
  );

  const readyOrders = useMemo(
    () =>
      (ordersData?.activeOrders ?? []).filter(
        (o) => o.status === "READY_FOR_PICKUP" || o.status === "OUT_FOR_DELIVERY"
      ),
    [ordersData]
  );

  const completedOrders = useMemo(
    () => ordersData?.completedOrders ?? [],
    [ordersData]
  );

  const incomingOffers = useMemo(
    () => ordersData?.incomingOffers ?? [],
    [ordersData]
  );

  const selectedOffer = useMemo(() => {
    if (activeTab !== "new") return null;
    return incomingOffers.find((o) => o.id === selectedItemId) || incomingOffers[0] || null;
  }, [activeTab, incomingOffers, selectedItemId]);

  const selectedOrder = useMemo(() => {
    if (activeTab === "new") return null;
    const list =
      activeTab === "preparing"
        ? preparingOrders
        : activeTab === "ready"
        ? readyOrders
        : completedOrders;
    return list.find((o) => o.id === selectedItemId) || list[0] || null;
  }, [activeTab, preparingOrders, readyOrders, completedOrders, selectedItemId]);

  const handleToggleStoreStatus = async (field: "isOnline" | "isOpen", value: boolean) => {
    try {
      const res = await apiRequest<{ vendor: VendorDTO; store: StoreDTO }>("/api/v1/vendor/store", {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
      setStore(res.store);
      showNotice(`Store ${field === "isOnline" ? "Online status" : "Open status"} updated.`);
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Failed to update store status.", true);
    }
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ vendor: VendorDTO; store: StoreDTO }>("/api/v1/vendor/store", {
        method: "PATCH",
        body: JSON.stringify({
          storeName: storeForm.storeName,
          addressLine: storeForm.addressLine,
          city: storeForm.city,
          pincode: storeForm.pincode,
          coordinates: { lat: Number(storeForm.lat), lng: Number(storeForm.lng) },
          serviceRadiusKm: Number(storeForm.serviceRadiusKm),
          openingTime: storeForm.openingTime,
          closingTime: storeForm.closingTime,
          maxConcurrentOrders: Number(storeForm.maxConcurrentOrders),
          autoAcceptTimeoutSec: Number(storeForm.autoAcceptTimeoutSec),
        }),
      });
      setStore(res.store);
      showNotice("Store settings saved to MongoDB.");
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Failed to save store settings.", true);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await apiRequest(`/api/v1/vendor/offers/${offerId}/accept`, { method: "POST" });
      showNotice("Order accepted! Moved to Preparing.");
      await loadDashboardData();
      setActiveTab("preparing");
      setSelectedItemId(null);
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Could not accept offer.", true);
      await loadDashboardData();
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await apiRequest(`/api/v1/vendor/offers/${offerId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Declined from vendor dashboard" }),
      });
      showNotice("Offer declined. Dispatching to next nearest vendor.");
      setSelectedItemId(null);
      await loadDashboardData();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Could not reject offer.", true);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED"
  ) => {
    try {
      await apiRequest(`/api/v1/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showNotice(`Order marked as ${status.replace(/_/g, " ")}.`);
      await loadDashboardData();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Failed to update order status.", true);
    }
  };

  const handleUpdateInventory = async (item: InventoryItem, nextQty: number, nextAvail: boolean) => {
    try {
      await apiRequest("/api/v1/vendor/inventory", {
        method: "PATCH",
        body: JSON.stringify({
          productId: item.productId,
          variantId: item.variantId,
          stockQty: Math.max(0, nextQty),
          isAvailable: nextAvail,
        }),
      });
      showNotice(`Updated ${item.productName} (${item.variantLabel}).`);
      await loadDashboardData();
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "Failed to update inventory.", true);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await apiRequest("/api/v1/vendor/notifications", {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/v1/vendor/auth/logout", { method: "POST" });
    } finally {
      router.replace("/vendor/login");
    }
  };

  if (loading || !vendor || !store || !ordersData) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-8">
        <p className="text-sm font-semibold text-gray-500">Loading Vendor Panel...</p>
      </div>
    );
  }

  const sidebarItems: {
    id: SidebarNav;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: "orders",
      label: "Dashboard & Orders",
      icon: LayoutDashboard,
      badge: incomingOffers.length > 0 ? incomingOffers.length : undefined,
    },
    { id: "products", label: "Products", icon: Package },
    { id: "stock", label: "Stock", icon: Boxes },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Store Settings", icon: Settings },
  ];

  const deliveredOrdersList = completedOrders.filter((o) => o.status === "DELIVERED");
  const averageOrderValue =
    deliveredOrdersList.length > 0
      ? Math.round(ordersData.metrics.totalRevenue / deliveredOrdersList.length)
      : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Dark Maroon Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#5E0C1E] text-white flex flex-col justify-between transition-transform duration-200 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Branding */}
          <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white text-[#D11243] flex items-center justify-center shadow-sm shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="font-black text-base tracking-tight leading-none">X-Chicken</p>
              <p className="text-[10px] font-bold tracking-widest text-rose-200 mt-1">
                VENDOR PANEL
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-5 space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setShowNotificationsPanel(false);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#7D1830] text-white shadow-sm"
                      : "text-rose-100/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Store Status & Logout (Vendor-Only, no storefront link) */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-3 py-2.5 rounded-xl bg-black/20 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-rose-200 font-semibold">Approval</span>
              <span className="font-black text-emerald-300">{vendor.approvalStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-rose-200 font-semibold">Store State</span>
              <span className="font-bold">
                {store.isOnline && store.isOpen ? "Online & Open" : "Offline / Closed"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="px-4 sm:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-gray-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {getGreeting()}, {store.storeName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your orders, products and store easily.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleToggleStoreStatus("isOnline", !store.isOnline)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                store.isOnline
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{store.isOnline ? "Online" : "Offline"}</span>
            </button>

            <button
              onClick={() => handleToggleStoreStatus("isOpen", !store.isOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${
                store.isOpen
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {store.isOpen ? "Open" : "Closed"}
            </button>

            <button
              onClick={() => setShowNotificationsPanel((v) => !v)}
              className="relative p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D11243] text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatShortDate(new Date())}</span>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-8 pb-10 space-y-6">
          {vendor.approvalStatus !== "APPROVED" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Your store approval status is <strong>{vendor.approvalStatus}</strong>. Admin
                approval is required before going Online or receiving live orders.
              </span>
            </div>
          )}

          {notice && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                notice.error
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}
            >
              {notice.error ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Notifications Drawer */}
          {showNotificationsPanel && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-sm">Real-Time Store Notifications</h2>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="text-xs font-bold text-[#D11243] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotificationsPanel(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No notifications yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs ${
                        n.isRead ? "border-gray-100 bg-white" : "border-rose-200 bg-rose-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{n.title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 1: DASHBOARD & ORDERS */}
          {activeNav === "orders" && (
            <div className="space-y-5">
              {/* 4 Pastel Summary Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-[#FFF2F4] border border-[#FFE0E5] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/80 text-[#D11243] flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">
                      {ordersData.metrics.incomingCount}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">New Orders</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/80 text-amber-600 flex items-center justify-center shrink-0">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">{preparingOrders.length}</p>
                    <p className="text-xs font-semibold text-gray-600">Preparing</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">
                      {ordersData.metrics.deliveredCount}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">Completed</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/80 text-purple-600 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900">
                      ₹{ordersData.metrics.totalRevenue}
                    </p>
                    <p className="text-xs font-semibold text-gray-600">Total Sales</p>
                  </div>
                </div>
              </div>

              {/* Order Status Pill Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "new" as const, label: `New Orders (${incomingOffers.length})` },
                  { id: "preparing" as const, label: `Preparing (${preparingOrders.length})` },
                  { id: "ready" as const, label: `Ready (${readyOrders.length})` },
                  { id: "completed" as const, label: `Completed (${completedOrders.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedItemId(null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#630D20] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Master-Detail View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Order List */}
                <div className="lg:col-span-5 space-y-3">
                  {activeTab === "new" ? (
                    incomingOffers.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-500">
                        No incoming order offers right now.
                      </div>
                    ) : (
                      incomingOffers.map((offer) => {
                        const isSelected = selectedOffer?.id === offer.id;
                        return (
                          <button
                            key={offer.id}
                            onClick={() => setSelectedItemId(offer.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-white border-[#D11243] ring-1 ring-[#D11243] shadow-xs"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-gray-900">
                                  #{offer.orderNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#D11243] text-white text-[10px] font-black">
                                  NEW
                                </span>
                              </div>
                              <p className="text-xs font-medium text-gray-500">
                                {offer.orderSummary.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                                {offer.orderSummary.items.reduce((sum, i) => sum + i.quantity, 0) === 1
                                  ? "item"
                                  : "items"}{" "}
                                • {offer.distanceKm} km away
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-black text-sm text-gray-900">
                                ₹{offer.orderSummary.totalAmount}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {formatTime(offer.offeredAt)}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )
                  ) : (
                    (() => {
                      const list =
                        activeTab === "preparing"
                          ? preparingOrders
                          : activeTab === "ready"
                          ? readyOrders
                          : completedOrders;
                      if (list.length === 0) {
                        return (
                          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs text-gray-500">
                            No orders in this status.
                          </div>
                        );
                      }
                      return list.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                          <button
                            key={order.id}
                            onClick={() => setSelectedItemId(order.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-white border-[#D11243] ring-1 ring-[#D11243] shadow-xs"
                                : "bg-white border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-gray-900">
                                  #{order.orderNumber}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black">
                                  {order.status.replace(/_/g, " ")}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-gray-500">
                                {order.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                                {order.items.reduce((sum, i) => sum + i.quantity, 0) === 1
                                  ? "item"
                                  : "items"}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-black text-sm text-gray-900">
                                ₹{order.totalAmount}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {formatTime(order.createdAt)}
                              </p>
                            </div>
                          </button>
                        );
                      });
                    })()
                  )}
                </div>

                {/* Right Column: Selected Order Details */}
                <div className="lg:col-span-7">
                  {activeTab === "new" && selectedOffer ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-2xs">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-black text-gray-900">
                              Order #{selectedOffer.orderNumber}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#D11243] text-white text-[10px] font-black">
                              NEW
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(() => {
                                const rem = Math.max(
                                  0,
                                  Math.ceil(
                                    (new Date(selectedOffer.expiresAt).getTime() - nowMs) / 1000
                                  )
                                );
                                return rem > 0
                                  ? `${Math.floor(rem / 60)}m ${rem % 60}s`
                                  : "Expiring...";
                              })()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Offered at {new Date(selectedOffer.offeredAt).toLocaleString()} •{" "}
                            {selectedOffer.distanceKm} km from store
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-black tracking-wider text-gray-400 uppercase">
                          Order Items
                        </p>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl px-4">
                          {selectedOffer.orderSummary.items.map((item, idx) => {
                            const imgSrc =
                              productImages.get(item.productId) || "/images/products/prod-2.jpg";
                            return (
                              <div
                                key={idx}
                                className="py-3 flex items-center justify-between gap-4 text-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={imgSrc}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                    <p className="text-gray-500">
                                      {item.variantLabel}
                                      {item.cutPreference ? ` • ${item.cutPreference}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-5 shrink-0">
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-bold text-gray-800">
                                    Qty {item.quantity}
                                  </span>
                                  <span className="font-black text-gray-900 w-16 text-right">
                                    ₹{item.lineTotal}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total Amount & Actions */}
                      <div className="p-4 rounded-xl bg-[#FFF2F4] flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">Order Total</span>
                        <span className="font-black text-lg text-[#D11243]">
                          ₹{selectedOffer.orderSummary.totalAmount}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          onClick={() => handleRejectOffer(selectedOffer.id)}
                          className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(selectedOffer.id)}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept Order
                        </button>
                      </div>
                    </div>
                  ) : activeTab !== "new" && selectedOrder ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-2xs">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-lg font-black text-gray-900">
                              Order #{selectedOrder.orderNumber}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black">
                              {selectedOrder.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Placed at {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[11px] font-black tracking-wider text-gray-400 uppercase">
                          Order Items
                        </p>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl px-4">
                          {selectedOrder.items.map((item, idx) => {
                            const imgSrc =
                              productImages.get(item.productId) || "/images/products/prod-2.jpg";
                            return (
                              <div
                                key={idx}
                                className="py-3 flex items-center justify-between gap-4 text-xs"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={imgSrc}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                    <p className="text-gray-500">
                                      {item.variantLabel}
                                      {item.cutPreference ? ` • ${item.cutPreference}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-5 shrink-0">
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 font-bold text-gray-800">
                                    Qty {item.quantity}
                                  </span>
                                  <span className="font-black text-gray-900 w-16 text-right">
                                    ₹{item.lineTotal}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FFF2F4] flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">Order Total</span>
                        <span className="font-black text-lg text-[#D11243]">
                          ₹{selectedOrder.totalAmount}
                        </span>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2.5">
                        {selectedOrder.status === "ASSIGNED" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, "PREPARING")}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Start Preparing
                          </button>
                        )}
                        {selectedOrder.status === "PREPARING" && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(selectedOrder.id, "READY_FOR_PICKUP")
                            }
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}
                        {selectedOrder.status === "READY_FOR_PICKUP" && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(selectedOrder.id, "OUT_FOR_DELIVERY")
                            }
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {(selectedOrder.status === "READY_FOR_PICKUP" ||
                          selectedOrder.status === "OUT_FOR_DELIVERY") && (
                          <button
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, "DELIVERED")}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-500">
                      Select an order from the list to view full details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRODUCTS */}
          {activeNav === "products" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base">Store Product Catalog ({inventory.length})</h2>
              </div>
              {inventory.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">No catalog products found.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.productName}{" "}
                          <span className="text-gray-500 font-normal">({item.variantLabel})</span>
                        </p>
                        <p className="text-gray-500">
                          Category: {item.category} • Price: ₹{item.priceOverride ?? item.basePrice}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleUpdateInventory(item, item.stockQty, !item.isAvailable)
                        }
                        className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer ${
                          item.isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: STOCK */}
          {activeNav === "stock" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-black text-base">Store Inventory &amp; Stock Control</h2>
              {inventory.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center">No inventory records.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.productName}{" "}
                          <span className="text-gray-500 font-normal">({item.variantLabel})</span>
                        </p>
                        <p className="text-gray-500">
                          Current Stock: <strong>{item.stockQty}</strong> packs
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateInventory(
                              item,
                              Math.max(0, item.stockQty - 5),
                              item.isAvailable
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleUpdateInventory(item, item.stockQty + 5, true)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: REPORTS */}
          {activeNav === "reports" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-bold text-gray-500">Delivered Orders</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {deliveredOrdersList.length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-bold text-gray-500">Delivered Revenue</p>
                  <p className="text-2xl font-black text-[#D11243] mt-1">
                    ₹{ordersData.metrics.totalRevenue}
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-bold text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">₹{averageOrderValue}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <h2 className="font-black text-base">Delivered Orders Ledger</h2>
                {deliveredOrdersList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center">
                    No delivered orders recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {deliveredOrdersList.map((o) => (
                      <div
                        key={o.id}
                        className="py-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold">#{o.orderNumber}</span> •{" "}
                          {o.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-black text-emerald-700">₹{o.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: STORE SETTINGS */}
          {activeNav === "settings" && (
            <form
              onSubmit={handleSaveStoreSettings}
              className="bg-white rounded-2xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2">
                <h2 className="font-black text-base">Store Profile, Location &amp; Dispatch</h2>
                <p className="text-xs text-gray-500">
                  Changes persist directly to MongoDB and govern nearest-vendor eligibility.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
                <input
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  value={storeForm.serviceRadiusKm}
                  onChange={(e) => setStoreForm({ ...storeForm, serviceRadiusKm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Address Line</label>
                <input
                  value={storeForm.addressLine}
                  onChange={(e) => setStoreForm({ ...storeForm, addressLine: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
                <input
                  value={storeForm.lat}
                  onChange={(e) => setStoreForm({ ...storeForm, lat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
                <input
                  value={storeForm.lng}
                  onChange={(e) => setStoreForm({ ...storeForm, lng: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Max Concurrent Orders
                </label>
                <input
                  type="number"
                  value={storeForm.maxConcurrentOrders}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, maxConcurrentOrders: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Offer Accept Timeout (sec)
                </label>
                <input
                  type="number"
                  value={storeForm.autoAcceptTimeoutSec}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, autoAcceptTimeoutSec: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#630D20] hover:bg-[#4A0918] text-white text-xs font-bold cursor-pointer"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
