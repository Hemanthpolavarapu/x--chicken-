"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCustomerProfileSchema, type AuthUser } from "@x-chicken/shared";
import { apiRequest, ApiClientError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/header/Navbar";
import { Footer } from "@/components/footer/Footer";
import { CustomerOrdersSection } from "@/components/orders/CustomerOrdersSection";
import { User, Mail, Phone, LogOut, CheckCircle2, ShoppingBag, Package } from "lucide-react";

export default function CustomerAccountPage() {
  const router = useRouter();
  const { customer, isLoading, setCustomer, logoutCustomer } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const name = nameDraft ?? customer?.name ?? "";
  const phone = phoneDraft ?? customer?.phone ?? "";

  useEffect(() => {
    if (!isLoading && !customer) {
      router.replace("/login");
    }
  }, [customer, isLoading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = updateCustomerProfileSchema.safeParse({ name, phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid profile details");
      return;
    }

    setSaving(true);
    try {
      const data = await apiRequest<{ profile: AuthUser }>(
        "/api/v1/customer/profile",
        {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        }
      );
      setCustomer(data.profile);
      setNotice("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    router.push("/login");
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm font-semibold text-gray-500">Verifying session...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Signed in as <span className="font-semibold text-gray-800">{customer.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Fresh Cuts</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-[#D11243]">
            {error}
          </div>
        )}

        {notice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeTab === "profile"
                ? "bg-[#D11243] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeTab === "orders"
                ? "bg-[#D11243] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </button>
        </div>

        {activeTab === "orders" ? (
          <CustomerOrdersSection />
        ) : (
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-2xs"
        >
          <h2 className="text-base font-black text-gray-900">Profile Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Account Role: <strong className="text-gray-700">{customer.role}</strong>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
