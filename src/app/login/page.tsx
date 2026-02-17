"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function GoogleButton({
  onSuccess,
  label = "Continue with Google",
}: {
  onSuccess: (credential: string) => void;
  label?: string;
}) {
  const [ready, setReady] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const callbackRef = useRef(onSuccess);
  callbackRef.current = onSuccess;

  useEffect(() => {
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    const initGoogleButton = () => {
      if (window.google?.accounts?.id && hiddenRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              callbackRef.current(response.credential);
            }
          },
        });
        window.google.accounts.id.renderButton(hiddenRef.current, {
          theme: "filled_black",
          size: "large",
          width: 300,
          text: "continue_with",
        });
        initializedRef.current = true;
        setReady(true);
      }
    };

    if (window.google) {
      initGoogleButton();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleButton;
      script.onerror = () =>
        console.error("Failed to load Google Identity Services");
      document.head.appendChild(script);
    }
  }, []);

  const handleClick = () => {
    const iframe = hiddenRef.current?.querySelector("iframe");
    if (iframe) {
      // Find and click the actual Google button inside the hidden container
      const btn = hiddenRef.current?.querySelector(
        '[role="button"]',
      ) as HTMLElement;
      if (btn) btn.click();
    }
  };

  return (
    <>
      {/* Hidden Google-rendered button */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          height: 0,
          overflow: "hidden",
        }}
      />
      {/* Custom visible button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {label}
      </button>
    </>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="fixed inset-0 bg-grid opacity-[0.02]" />
        <div className="fixed left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="relative z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Google login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid opacity-[0.02]" />
      <div className="fixed left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <ShieldCheckSolid className="h-7 w-7 text-emerald-400" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sign in to your ContractSentinel account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50"
        >
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="mb-6">
            <GoogleButton onSuccess={handleGoogleLogin} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900/50 px-4 text-zinc-500">
                or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Sign In
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
