"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OrderDTO } from "@x-chicken/shared";
import { apiRequest, getApiBaseUrl } from "@/lib/apiClient";
import { PRODUCTS } from "@/data/products";
import {
  ShoppingBag,
  MapPin,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  X,
  Store,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface OrderEventItem {
  id: string;
  eventType: string;
  message: string;
  actorRole: string;
  createdAt: string;
}

interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const LIFECYCLE_STEPS = [
  { key: "ASSIGNED", label: "Accepted by Store" },
  { key: "PREPARING", label: "Freshly Preparing" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

function getPaymentStatusLabel(order: OrderDTO): string {
  if (order.paymentMethod === "COD") {
    return order.status === "DELIVERED"
      ? "Pay on Delivery • Collected"
      : "Pay on Delivery • Payment Pending";
  }
  return "Online • Pending";
}

export function CustomerOrdersSection() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackedOrder, setTrackedOrder] = useState<OrderDTO | null>(null);
  const [trackedEvents, setTrackedEvents] = useState<OrderEventItem[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const productImages = useMemo(
    () => new Map(PRODUCTS.map((p) => [p.id, p.image])),
    []
  );

  const loadOrders = useCallback(async (page = 1) => {
    setError(null);
    try {
      const res = await apiRequest<{
        orders: OrderDTO[];
        pagination?: OrdersPagination;
      }>(`/api/v1/orders?page=${page}&limit=10`);
      setOrders(res.orders);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  // Realtime SSE updates for the first active order or currently tracked order
  useEffect(() => {
    const activeOrder =
      trackedOrder ||
      orders.find((o) =>
        [
          "PENDING",
          "SEARCHING",
          "OFFERED",
          "ASSIGNED",
          "PREPARING",
          "READY_FOR_PICKUP",
          "OUT_FOR_DELIVERY",
        ].includes(o.status)
      );
    if (!activeOrder) return;

    const es = new EventSource(
      `${getApiBaseUrl()}/api/v1/orders/${activeOrder.id}/stream`,
      { withCredentials: true }
    );
    es.addEventListener("order_update", (event) => {
      try {
        const updated = JSON.parse((event as MessageEvent).data) as OrderDTO;
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (trackedOrder && trackedOrder.id === updated.id) {
          setTrackedOrder(updated);
        }
      } catch {
        // ignore parse error
      }
    });
    return () => es.close();
  }, [orders, trackedOrder]);

  const handleOpenTracking = async (order: OrderDTO) => {
    setTrackedOrder(order);
    setTrackedEvents([]);
    setTrackingLoading(true);
    try {
      const res = await apiRequest<{ order: OrderDTO; events: OrderEventItem[] }>(
        `/api/v1/orders/${order.id}`
      );
      setTrackedOrder(res.order);
      setTrackedEvents(res.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order tracking.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setError(null);
    try {
      await apiRequest(`/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Cancelled by customer" }),
      });
      await loadOrders(pagination.page);
      if (trackedOrder?.id === orderId) {
        const refreshed = await apiRequest<{ order: OrderDTO; events: OrderEventItem[] }>(
          `/api/v1/orders/${orderId}`
        );
        setTrackedOrder(refreshed.order);
        setTrackedEvents(refreshed.events);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel order.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-xs font-semibold text-gray-500">
        Loading your order history...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">My Orders</h2>
          <p className="text-xs text-gray-500">
            {pagination.total} {pagination.total === 1 ? "order" : "orders"} placed
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadOrders(pagination.page)}
          className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-[#D11243] flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => loadOrders(pagination.page)}
            className="underline font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-800">
            You haven&apos;t placed an order yet.
          </p>
          <p className="text-xs text-gray-500">
            Explore our fresh, never-frozen chicken cuts to place your first order.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#D11243] hover:bg-[#B00E37] text-white text-xs font-bold"
          >
            Shop Fresh Cuts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-2xs"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-gray-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-[#D11243]">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right space-y-0.5">
                  <p className="font-black text-base text-gray-900">₹{order.totalAmount}</p>
                  <p className="text-[11px] font-semibold text-gray-500 flex items-center justify-end gap-1">
                    <CreditCard className="w-3 h-3" />
                    {getPaymentStatusLabel(order)}
                  </p>
                </div>
              </div>

              {/* Assigned Store */}
              {order.storeName && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Fulfilling Store: {order.storeName}</span>
                </div>
              )}

              {/* Items with images */}
              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => {
                  const imgSrc = productImages.get(item.productId) || "/images/products/prod-2.jpg";
                  return (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
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
                            {item.variantLabel} • Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">₹{item.lineTotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{order.deliveryFee === 0 ? "FREE (₹0)" : `₹${order.deliveryFee}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-gray-900 pt-1 border-t border-gray-200">
                  <span>Final Amount</span>
                  <span className="text-[#D11243]">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Address & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-start gap-1.5 text-gray-600 max-w-md">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress.recipientName} ({order.deliveryAddress.phone}) —{" "}
                    {order.deliveryAddress.addressLine}, {order.deliveryAddress.city} -{" "}
                    {order.deliveryAddress.pincode}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {["PENDING", "SEARCHING", "OFFERED", "NO_VENDOR_AVAILABLE"].includes(
                    order.status
                  ) && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenTracking(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View / Track Order
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => loadOrders(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadOrders(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View / Track Order Modal */}
      {trackedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900">
                  Order {trackedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Status: <strong>{trackedOrder.status.replace(/_/g, " ")}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackedOrder(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lifecycle Progress */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-gray-400">
                Fulfillment Progress
              </p>
              <div className="space-y-2">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const currentIdx = LIFECYCLE_STEPS.findIndex(
                    (s) => s.key === trackedOrder.status
                  );
                  const reached = currentIdx >= idx;
                  return (
                    <div key={step.key} className="flex items-center gap-2.5 text-xs">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          reached ? "text-emerald-600" : "text-gray-300"
                        }`}
                      />
                      <span className={reached ? "font-bold text-gray-900" : "text-gray-400"}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Persisted Backend Event Log */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-gray-400">
                Persisted Order Timeline
              </p>
              {trackingLoading ? (
                <p className="text-xs text-gray-500">Loading timeline...</p>
              ) : trackedEvents.length === 0 ? (
                <p className="text-xs text-gray-500">No events recorded yet.</p>
              ) : (
                <div className="space-y-2 border-l-2 border-rose-200 pl-3">
                  {trackedEvents.map((ev) => (
                    <div key={ev.id} className="text-xs">
                      <p className="font-bold text-gray-900">{ev.message}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(ev.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
