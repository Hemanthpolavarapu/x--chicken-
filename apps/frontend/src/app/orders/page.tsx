"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/header/Navbar";
import { Footer } from "@/components/footer/Footer";
import { CustomerOrdersSection } from "@/components/orders/CustomerOrdersSection";
import { ArrowLeft, User } from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !customer) {
      router.replace("/login");
    }
  }, [customer, isLoading, router]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm font-semibold text-gray-500">Loading your orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D11243]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </Link>
        </div>

        <CustomerOrdersSection />
      </main>
      <Footer />
    </div>
  );
}
