"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { Store, ArrowRight, AlertCircle, MapPin } from "lucide-react";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    storeName: "",
    addressLine: "",
    city: "Hyderabad",
    pincode: "500081",
    lat: "17.4435",
    lng: "78.3772",
    serviceRadiusKm: "10",
    fssaiLicense: "",
    gstNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((prev) => ({
        ...prev,
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest("/api/v1/vendor/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          storeName: form.storeName,
          addressLine: form.addressLine,
          city: form.city,
          pincode: form.pincode,
          coordinates: {
            lat: Number(form.lat),
            lng: Number(form.lng),
          },
          serviceRadiusKm: Number(form.serviceRadiusKm),
          fssaiLicense: form.fssaiLicense,
          gstNumber: form.gstNumber,
        }),
      });
      router.push("/vendor/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FFF0F2] text-[#D11243] flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Register Your X-Chicken Store</h1>
            <p className="text-xs text-gray-500">
              Submit your store details for admin verification &amp; live order dispatch
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Owner Full Name</label>
            <input
              required
              value={form.ownerName}
              onChange={(e) => handleChange("ownerName", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
            <input
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Business Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="owner@freshhub.in"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="Min 8 chars, upper, lower, number"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Store Name</label>
            <input
              required
              value={form.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="X-Chicken Madhapur Fresh Hub"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Store Address</label>
            <input
              required
              value={form.addressLine}
              onChange={(e) => handleChange("addressLine", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="Plot 42, 100 Feet Road, Madhapur"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
            <input
              required
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
            <input
              required
              value={form.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Latitude</label>
            <input
              required
              value={form.lat}
              onChange={(e) => handleChange("lat", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Longitude</label>
            <div className="flex gap-2">
              <input
                required
                value={form.lng}
                onChange={(e) => handleChange("lng", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUseBrowserLocation}
                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                title="Use current GPS"
              >
                <MapPin className="w-3.5 h-3.5" /> GPS
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Service Radius (km)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={form.serviceRadiusKm}
              onChange={(e) => handleChange("serviceRadiusKm", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">FSSAI License No.</label>
            <input
              required
              value={form.fssaiLicense}
              onChange={(e) => handleChange("fssaiLicense", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="13624011000421"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              GST Number (Optional)
            </label>
            <input
              value={form.gstNumber}
              onChange={(e) => handleChange("gstNumber", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D11243] focus:outline-none"
              placeholder="36ABCDE1234F1Z5"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{loading ? "Submitting Application..." : "Create Vendor Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end text-xs text-gray-600">
          <Link href="/vendor/login" className="text-[#D11243] font-bold hover:underline">
            Already registered? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
