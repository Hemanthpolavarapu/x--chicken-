"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, type AuthUser } from "@x-chicken/shared";
import { apiRequest, ApiClientError } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/header/Navbar";
import { Footer } from "@/components/footer/Footer";
import { Lock, Mail, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { customer, setCustomer, isLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && customer) {
      router.replace("/account");
    }
  }, [customer, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid login input");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest<{ user: AuthUser }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      setCustomer(data.user);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid email");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest<{ message: string; devResetToken?: string }>(
        "/api/v1/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify(parsed.data),
        }
      );
      if (data.devResetToken) {
        setResetToken(data.devResetToken);
      }
      setNotice(data.message);
      setMode("reset");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = resetPasswordSchema.safeParse({
      token: resetToken,
      newPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid reset input");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest<{ message: string }>(
        "/api/v1/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(parsed.data),
        }
      );
      setNotice(data.message);
      setPassword("");
      setNewPassword("");
      setResetToken("");
      setMode("login");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-black text-gray-950">
              {mode === "login" && "Customer Sign In"}
              {mode === "forgot" && "Reset Password"}
              {mode === "reset" && "Set New Password"}
            </h1>
            <p className="text-xs text-gray-500">
              {mode === "login" && "Access your Chiken Fresh Meat account and saved profile."}
              {mode === "forgot" && "Enter your registered email to receive a reset token."}
              {mode === "reset" && "Enter your reset token and choose a strong new password."}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-[#D11243]">
              {error}
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setNotice(null);
                      setMode("forgot");
                    }}
                    className="text-xs font-semibold text-[#D11243] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{submitting ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                {submitting ? "Generating Token..." : "Send Reset Token"}
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Reset Token</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, upper, lower & number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D11243] hover:bg-[#B00E37] disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                {submitting ? "Updating Password..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
            <p>
              New to Chiken Fresh Meat?{" "}
              <Link href="/register" className="font-bold text-[#D11243] hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              <Link href="/" className="text-gray-400 hover:text-gray-700 underline">
                Continue browsing store without signing in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
