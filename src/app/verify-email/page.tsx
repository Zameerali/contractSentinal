"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus("success");
        // Auto-redirect to dashboard after 3s (user is auto-logged in)
        setTimeout(() => router.push("/dashboard"), 3000);
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Verification failed");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="fixed inset-0 bg-grid opacity-[0.02]" />
      <div className="fixed left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <ShieldCheckSolid className="h-7 w-7 text-emerald-400" />
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-3 border-emerald-500/30 border-t-emerald-500" />
              <p className="text-sm text-zinc-400">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Email Verified!
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Your account is now active. Redirecting to dashboard...
                </p>
              </div>
              <Link
                href="/dashboard"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
              >
                Go to Dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
                <XCircleIcon className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Verification Failed
                </h2>
                <p className="mt-2 text-sm text-red-400">{error}</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/register"
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
