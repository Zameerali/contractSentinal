"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

function GoogleButton({
  onSuccess,
}: {
  onSuccess: (credential: string) => void;
}) {
  const [ready, setReady] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
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
      if (window.google?.accounts?.id && btnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              callbackRef.current(response.credential);
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "filled_black",
          size: "large",
          width: 400,
          shape: "pill",
          text: "signup_with",
        });
        initializedRef.current = true;
        requestAnimationFrame(() => setReady(true));
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

  return (
    <div
      className="flex items-center justify-center w-full transition-opacity duration-300"
      style={{ minHeight: 44, opacity: ready ? 1 : 0 }}
    >
      <div ref={btnRef} />
    </div>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { user, loading: authLoading, register, loginWithGoogle } = useAuth();
  const router = useRouter();

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

  // Don't render anything if user is logged in or auth is still loading (handled above)
  if (authLoading || user) {
    return null;
  }

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
      const result = await register(email, password, name);
      if (result?.requiresVerification) {
        setVerificationSent(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credential: string) => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Verification sent screen
  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="fixed inset-0 bg-grid opacity-[0.02]" />
        <div className="fixed left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-black/50">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <EnvelopeIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="mt-2 text-sm text-zinc-400">
              We&apos;ve sent a verification link to{" "}
              <span className="font-medium text-white">{email}</span>
            </p>
            <p className="mt-4 text-xs text-zinc-600">
              Click the link in the email to activate your account. The link
              expires in 24 hours.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
            >
              Go to Login
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="mt-4 text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Start scanning smart contracts with AI
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

          {/* Google Sign Up */}
          <div className="mb-6">
            <GoogleButton onSuccess={handleGoogleSignup} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900/50 px-4 text-zinc-500">
                or sign up with email
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
              />
            </div>

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
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Password
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

              {/* Password strength */}
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
                Create Account
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
