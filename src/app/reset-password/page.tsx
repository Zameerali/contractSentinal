"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/components/providers/AuthProvider";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      // Auto-redirect to dashboard after 2s since user is auto-logged in
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50">
            <p className="text-sm text-red-400">
              Invalid reset link. Please request a new password reset.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
            >
              Request New Reset
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="fixed inset-0 bg-grid opacity-[0.02]" />
      <div className="fixed left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <ShieldCheckSolid className="h-7 w-7 text-emerald-400" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {success ? "Password reset!" : "Set new password"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {success
              ? "Redirecting you to the dashboard..."
              : "Choose a strong password for your account"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-sm text-zinc-400">
                Your password has been updated and you&apos;re now logged in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-3 space-y-1.5">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full ${
                            check.met ? "bg-emerald-500" : "bg-zinc-700"
                          }`}
                        >
                          {check.met && (
                            <CheckIcon className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-xs ${check.met ? "text-zinc-300" : "text-zinc-600"}`}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 8}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
