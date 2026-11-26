"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/apiClient";
import { Store, AlertCircle } from "lucide-react";

export default function VendorTestClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/vendor/auth/dev-test-login", {
      method: "POST",
    })
      .then(() => {
        if (!cancelled) {
          router.replace("/vendor/dashboard");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not start Vendor Test session. Ensure backend is running and test vendor is provisioned."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-lg p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#FFF0F2] text-[#D11243] flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-black text-gray-900">Vendor Test Direct Access</h1>
        {error ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              href="/vendor/login"
              className="inline-block text-xs font-bold text-[#D11243] hover:underline"
            >
              Go to Normal Vendor Login →
            </Link>
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Authenticating local <strong>Vendor Test</strong> session and opening dashboard...
          </p>
        )}
      </div>
    </div>
  );
}
