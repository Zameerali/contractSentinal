"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  BoltIcon,
  EyeIcon,
  DocumentChartBarIcon,
  CubeTransparentIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";

const features = [
  {
    icon: BoltIcon,
    title: "AI-Powered Analysis",
    description:
      "Gemini 2.0 Flash scans source code for honeypot traps, rug pull patterns, and hidden owner privileges.",
  },
  {
    icon: EyeIcon,
    title: "Known Scam Detection",
    description:
      "Cross-reference against a database of known scam contracts and malicious wallet addresses.",
  },
  {
    icon: DocumentChartBarIcon,
    title: "PDF Reports",
    description:
      "Generate detailed security reports with risk breakdowns, pattern analysis, and recommendations.",
  },
  {
    icon: CubeTransparentIcon,
    title: "Multi-Chain Support",
    description:
      "Scan contracts on Ethereum, Polygon, Arbitrum, Optimism, and BNB Chain. Batch scan up to 10 at once.",
  },
];

const stats = [
  { label: "Chains Supported", value: "5" },
  { label: "Batch Scan Limit", value: "10" },
  { label: "AI Model", value: "Gemini 2.0" },
  { label: "Report Format", value: "PDF" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShieldCheckSolid className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Contract<span className="text-emerald-400">Sentinel</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Split Layout */}
      <section className="relative w-full h-screen flex items-center justify-center px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 w-full">
          {/* Left — Text */}
          <div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" />
              AI-Powered Smart Contract Security
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Detect rug pulls
              <br />
              <span className="text-emerald-400">before you invest</span>
            </h1>

            <p className="mb-8 max-w-lg text-base text-zinc-400 leading-relaxed">
              ContractSentinel scans smart contracts for honeypot traps, hidden
              exploits, and known scam patterns using AI analysis. Multi-chain
              support, batch scanning, and detailed PDF reports.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
              >
                Start Scanning Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Compact stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Mock scan card */}
          <div className="hidden lg:block">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheckSolid className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-semibold">Scan Result</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  SAFE
                </span>
              </div>

              {/* Contract info */}
              <div className="rounded-lg bg-zinc-950 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Contract</span>
                  <span className="font-mono text-zinc-300">
                    0xdAC1...31ec7
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Name</span>
                  <span className="text-zinc-300">Tether (USDT)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Chain</span>
                  <span className="text-zinc-300">Ethereum</span>
                </div>
              </div>

              {/* Risk score bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-500">Risk Score</span>
                  <span className="text-xs font-bold text-emerald-400">
                    12 / 100
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: "12%" }}
                  />
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400">
                  Key Findings
                </p>
                <div className="flex items-start gap-2 rounded-lg bg-zinc-950 p-2.5">
                  <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="text-xs text-zinc-300">
                    No hidden mint functions detected
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-zinc-950 p-2.5">
                  <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="text-xs text-zinc-300">
                    Owner privileges are transparent and limited
                  </span>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-zinc-950 p-2.5">
                  <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="text-xs text-zinc-300">
                    No transfer restrictions or sell blocks found
                  </span>
                </div>
              </div>

              {/* Danger example */}
              <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">
                    Flagged Contract
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400">0x0000...dead</span>
                  <span className="font-semibold text-red-400">Risk: 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
              How it works
            </h2>
            <p className="max-w-lg text-sm text-zinc-400">
              Multi-layered approach combining AI analysis, pattern matching,
              and known scam databases.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
              >
                <feature.icon className="mb-3 h-5 w-5 text-emerald-400" />
                <h3 className="mb-1.5 text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="border-t border-zinc-800/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
              Built with security in mind
            </h2>
            <p className="max-w-lg text-sm text-zinc-400">
              Enterprise-grade authentication and data protection out of the
              box.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: LockClosedIcon,
                title: "Secure Auth",
                desc: "JWT tokens with refresh rotation, argon2id hashing, email verification, and Google OAuth.",
              },
              {
                icon: ChartBarIcon,
                title: "Audit Logs",
                desc: "Every scan, login, and admin action is tracked with full audit trail and IP logging.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Rate Limiting",
                desc: "Per-user and per-IP rate limiting on all endpoints to prevent abuse.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
              >
                <item.icon className="mb-3 h-5 w-5 text-zinc-400" />
                <h3 className="mb-1.5 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Ready to scan your contracts?
          </h2>
          <p className="mb-6 text-sm text-zinc-400">
            Create an account and start analyzing smart contracts in seconds.
            Free to use.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Get Started Free
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckSolid className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold">
              Contract<span className="text-emerald-400">Sentinel</span>
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Built for hackathon. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
