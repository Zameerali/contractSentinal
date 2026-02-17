"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  EyeIcon,
  DocumentChartBarIcon,
  CubeTransparentIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";

const features = [
  {
    icon: BoltIcon,
    title: "AI-Powered Analysis",
    description:
      "Gemini 2.0 Flash scans source code for honeypot traps, rug pull patterns, and hidden owner privileges.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    icon: EyeIcon,
    title: "Known Scam Detection",
    description:
      "Cross-reference against a database of known scam contracts and malicious wallet addresses.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    ring: "ring-cyan-500/20",
  },
  {
    icon: DocumentChartBarIcon,
    title: "PDF Reports",
    description:
      "Generate detailed security reports with risk breakdowns, pattern analysis, and recommendations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
  {
    icon: CubeTransparentIcon,
    title: "Multi-Chain Support",
    description:
      "Scan contracts on Ethereum, Polygon, Arbitrum, Optimism, and BNB Chain. Batch scan up to 10 at once.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
];

const demoScans = [
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    name: "Tether (USDT)",
    verdict: "SAFE",
    risk: 12,
    color: "text-emerald-400",
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    name: "USD Coin (USDC)",
    verdict: "SAFE",
    risk: 8,
    color: "text-emerald-400",
  },
  {
    address: "0x000000000000000000000000000000000000dead",
    name: "Dead Address",
    verdict: "KNOWN SCAM",
    risk: 100,
    color: "text-red-400",
  },
];

export default function LandingPage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      router.push(`/login?redirect=/dashboard/scan&address=${address}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <ShieldCheckSolid className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold">
              Contract<span className="text-emerald-400">Sentinel</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all hover:shadow-emerald-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Powered by Gemini 2.0 Flash AI</span>
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight sm:text-7xl">
            <span className="block">Scan any token.</span>
            <span className="block gradient-text">Protect your portfolio.</span>
            <span className="block text-zinc-400">
              Stop the next <span className="text-red-400">rug pull</span>.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            ContractSentinel uses AI-powered analysis to detect honeypot
            contracts, rug pulls, and hidden exploits before you invest. Scan
            any smart contract in seconds.
          </p>

          {/* Quick scan bar */}
          <form onSubmit={handleQuickScan} className="mx-auto mb-8 max-w-2xl">
            <div className="group relative flex items-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-2 shadow-2xl shadow-black/50 transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/10">
              <MagnifyingGlassIcon className="ml-4 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste contract address (0x...)"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!address.match(/^0x[a-fA-F0-9]{40}$/)}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Scan
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              Free to use
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              Multi-chain support
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              Batch scanning
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              PDF reports
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Enterprise-grade{" "}
              <span className="gradient-text">security analysis</span>
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-400">
              Our multi-layered approach combines AI analysis, pattern matching,
              and known scam databases to provide comprehensive contract
              security insights.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ring-1 ${feature.ring}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Scans */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              See it in <span className="gradient-text">action</span>
            </h2>
            <p className="text-zinc-400">
              Real contract analysis results from our scanning engine
            </p>
          </div>

          <div className="space-y-3">
            {demoScans.map((scan, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      scan.verdict === "SAFE"
                        ? "bg-emerald-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {scan.verdict === "SAFE" ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {scan.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {scan.address.slice(0, 10)}...{scan.address.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${scan.color}`}>
                      {scan.verdict}
                    </p>
                    <p className="text-xs text-zinc-500">Risk: {scan.risk}%</p>
                  </div>
                  <div className="h-8 w-20 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        scan.risk <= 25
                          ? "bg-emerald-500"
                          : scan.risk <= 50
                            ? "bg-cyan-500"
                            : scan.risk <= 75
                              ? "bg-amber-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${scan.risk}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to scan your{" "}
            <span className="text-emerald-400">contracts</span>?
          </h2>
          <p className="mb-8 text-zinc-400">
            Join ContractSentinel and protect your assets with AI-powered smart
            contract analysis.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
          >
            Get Started Free
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckSolid className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold">
              Contract<span className="text-emerald-400">Sentinel</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Built for hackathon. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
