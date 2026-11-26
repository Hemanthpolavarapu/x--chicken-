"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser, OrderDTO, StoreDTO, VendorDTO } from "@x-chicken/shared";
import { apiRequest } from "@/lib/apiClient";
import {
  ShieldCheck,
  Users,
  KeyRound,
  LogOut,
  ExternalLink,
  Store,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

interface AdminOverviewData {
  admin: AuthUser;
  metrics: {
    totalCustomers: number;
    totalAdmins: number;
    activeSessions: number;
  };
  recentCustomers: AuthUser[];
}

interface AdminVendorItem {
  vendor: VendorDTO;
  store: StoreDTO | null;
}

interface AdminOrderItem {
  order: OrderDTO;
  dispatch: {
    status: string;
    attemptCount: number;
    attemptedVendorCount: number;
    failureReason?: string;
  } | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [vendors, setVendors] = useState<AdminVendorItem[]>([]);
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [overviewRes, vendorsRes, ordersRes] = await Promise.all([
        apiRequest<AdminOverviewData>("/api/v1/admin/overview"),
        apiRequest<{ vendors: AdminVendorItem[] }>("/api/v1/admin/vendors"),
        apiRequest<{ orders: AdminOrderItem[] }>("/api/v1/admin/orders"),
      ]);
      setData(overviewRes);
      setVendors(vendorsRes.vendors);
      setOrders(ordersRes.orders);
      setLoading(false);
    } catch {
      router.replace("/admin/login");
    }
  };

  useEffect(() => {
    loadAll();
  }, [router]);

  const handleVendorStatus = async (
    vendorId: string,
    approvalStatus: "APPROVED" | "REJECTED" | "SUSPENDED"
  ) => {
    try {
      await apiRequest(`/api/v1/admin/vendors/${vendorId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus }),
      });
      setActionMsg(`Vendor marked as ${approvalStatus}.`);
      await loadAll();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed to update vendor status.");
    }
  };

  const handleRetryDispatch = async (orderId: string) => {
    try {
      await apiRequest(`/api/v1/admin/dispatches/${orderId}/retry`, { method: "POST" });
      setActionMsg("Dispatch retried from nearest eligible vendor.");
      await loadAll();
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed to retry dispatch.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest<{ loggedOut: boolean }>("/api/v1/admin/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/admin/login");
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-8">
        <p className="text-sm font-semibold text-gray-500">
          Verifying administrator authorization...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900">
      <header className="bg-[#630D20] text-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg">X-Chicken Admin Console</h1>
            <p className="text-[11px] text-rose-200">{data.admin.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#630D20] hover:bg-rose-50 text-xs font-black cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#D11243] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-950">{data.metrics.totalCustomers}</p>
              <p className="text-xs font-semibold text-gray-500">Registered Customers</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-950">{data.metrics.totalAdmins}</p>
              <p className="text-xs font-semibold text-gray-500">Provisioned Admins</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-950">{data.metrics.activeSessions}</p>
              <p className="text-xs font-semibold text-gray-500">Active Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-black text-base text-gray-950">Recent Customer Accounts</h2>
          </div>
          {data.recentCustomers.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No customer accounts registered yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentCustomers.map((c) => (
                <div
                  key={c.id}
                  className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-gray-500">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      {c.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-bold">
                      {c.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {actionMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {actionMsg}
          </div>
        )}

        {/* Vendor Approvals */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#D11243]" />
              <h2 className="font-black text-base text-gray-950">
                Vendor Partner Approvals ({vendors.length})
              </h2>
            </div>
            <button
              onClick={loadAll}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          {vendors.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No vendors registered yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {vendors.map(({ vendor, store }) => (
                <div
                  key={vendor.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {store?.storeName || vendor.ownerName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          vendor.approvalStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : vendor.approvalStatus === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vendor.approvalStatus}
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {vendor.ownerName} • {vendor.email} • FSSAI: {vendor.fssaiLicense}
                    </p>
                    {store && (
                      <p className="text-gray-400">
                        {store.addressLine}, {store.city} • Radius {store.serviceRadiusKm} km •{" "}
                        {store.isOnline ? "Online" : "Offline"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {vendor.approvalStatus !== "APPROVED" && (
                      <button
                        onClick={() => handleVendorStatus(vendor.id, "APPROVED")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {vendor.approvalStatus === "PENDING" && (
                      <button
                        onClick={() => handleVendorStatus(vendor.id, "REJECTED")}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    {vendor.approvalStatus === "APPROVED" && (
                      <button
                        onClick={() => handleVendorStatus(vendor.id, "SUSPENDED")}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Order Dispatch Console */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#D11243]" />
            <h2 className="font-black text-base text-gray-950">
              Order Dispatch Monitoring ({orders.length})
            </h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">No orders placed yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map(({ order, dispatch }) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm">{order.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#D11243] font-bold text-[10px]">
                        {order.status}
                      </span>
                      <span className="font-bold">₹{order.totalAmount}</span>
                    </div>
                    <p className="text-gray-500">
                      Customer: {order.customerName} •{" "}
                      {order.storeName ? `Store: ${order.storeName}` : "Unassigned"} • Dispatch
                      attempts: {dispatch?.attemptCount ?? 0}
                    </p>
                  </div>
                  {(order.status === "NO_VENDOR_AVAILABLE" || order.status === "OFFERED") && (
                    <button
                      onClick={() => handleRetryDispatch(order.id)}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold cursor-pointer shrink-0"
                    >
                      Retry Dispatch
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
