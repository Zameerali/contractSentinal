"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import { Select } from "@/ui/select";
import { Heading, Subheading } from "@/ui/heading";
import { Text } from "@/ui/text";
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function ScanPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) return;
    setScanning(true);
    setResult(null);
    setShowConfetti(false);

    try {
      const res = await authFetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: address, chain }),
      });
      const data = await res.json();
      if (data.error) {
        setResult({ error: data.error });
      } else {
        const scanData = data.scan || data;
        setResult(scanData);

        // Confetti on SAFE
        if (scanData.riskScore <= 25 && !scanData.error) {
          setShowConfetti(true);
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#10b981", "#22d3ee", "#34d399"],
            });
          } catch {}
        }
      }
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setScanning(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    if (!verdict)
      return {
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        border: "border-zinc-700",
      };
    const v = verdict.toUpperCase();
    if (v.includes("SAFE") || v.includes("LOW"))
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      };
    if (v.includes("MEDIUM") || v.includes("CAUTION"))
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      };
    return {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2} className="!text-lg">
          Scan Contract
        </Heading>
        <Text className="mt-0.5">
          Analyze a smart contract for security vulnerabilities
        </Text>
      </div>

      {/* Scan Form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <Subheading className="mb-3">Scan Contract</Subheading>
        <form onSubmit={handleScan} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Contract Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Chain
            </label>
            <Select
              value={chain}
              onChange={(val) => setChain(val)}
              options={[
                { value: "1", label: "Ethereum Mainnet" },
                { value: "137", label: "Polygon" },
                { value: "42161", label: "Arbitrum" },
                { value: "10", label: "Optimism" },
                { value: "56", label: "BNB Chain" },
              ]}
            />
          </div>

          <button
            type="submit"
            disabled={scanning || !address.match(/^0x[a-fA-F0-9]{40}$/)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {scanning ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing contract...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5" />
                Scan Contract
              </>
            )}
          </button>
        </form>

        {/* Demo addresses */}
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs text-zinc-600">
            Try these demo addresses:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              {
                addr: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                label: "USDT",
              },
              {
                addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                label: "USDC",
              },
              {
                addr: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                label: "DAI",
              },
            ].map((demo) => (
              <button
                key={demo.label}
                onClick={() => setAddress(demo.addr)}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
            <MagnifyingGlassIcon className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            AI is analyzing the contract...
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            This may take 10-30 seconds
          </p>
        </div>
      )}

      {/* Result */}
      {result && !scanning && (
        <div
          className={`animate-fade-in rounded-2xl border ${result.error ? "border-red-500/20" : "border-zinc-800"} bg-zinc-900/50 overflow-hidden`}
        >
          {result.error ? (
            <div className="flex items-center gap-3 p-6">
              <XCircleIcon className="h-6 w-6 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{result.error}</p>
            </div>
          ) : (
            <>
              {/* Honeypot overlay for critical risks */}
              {result.riskScore >= 85 && (
                <div className="relative border-b border-red-500/20 bg-red-500/5 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="pump-animation inline-flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-400">
                        ⚠️ HONEYPOT DETECTED
                      </p>
                      <p className="text-sm text-red-400/70">
                        This contract contains dangerous patterns. DO NOT
                        INVEST.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SAFE confetti overlay */}
              {result.riskScore <= 25 && (
                <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                    <div>
                      <p className="text-lg font-bold text-emerald-400">
                        ✅ CONTRACT LOOKS SAFE
                      </p>
                      <p className="text-sm text-emerald-400/70">
                        No critical vulnerabilities detected.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk gauge + details */}
              <div className="flex flex-col items-center gap-8 p-8 sm:flex-row">
                <RiskGauge score={result.riskScore || 0} size={200} />
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${getVerdictStyle(result.verdict).bg} ${getVerdictStyle(result.verdict).text} ${getVerdictStyle(result.verdict).border}`}
                    >
                      {result.verdict}
                    </span>
                    {result.contractName && (
                      <span className="text-base font-semibold text-white">
                        {result.contractName}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs text-zinc-500 font-mono break-all">
                    {result.contractAddress}
                  </p>
                  {(result.summary || result.explanation) && (
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {result.summary || result.explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Findings */}
              {result.findings?.length > 0 && (
                <div className="border-t border-zinc-800 p-6">
                  <h3 className="mb-4 text-sm font-bold text-white uppercase tracking-wider">
                    Security Findings
                  </h3>
                  <div className="space-y-2">
                    {result.findings.map((f: any, i: number) => {
                      const severity = (f.severity || "info").toLowerCase();
                      const colors =
                        severity === "critical" || severity === "high"
                          ? "bg-red-500/5 border-red-500/10 text-red-400"
                          : severity === "medium"
                            ? "bg-amber-500/5 border-amber-500/10 text-amber-400"
                            : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400";
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 rounded-xl border p-3 ${colors}`}
                        >
                          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              {f.title || f.pattern}
                            </p>
                            {f.description && (
                              <p className="mt-0.5 text-xs opacity-70">
                                {f.description}
                              </p>
                            )}
                            {f.severity && (
                              <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                                {f.severity}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-zinc-800 p-4">
                <button
                  onClick={() => router.push(`/dashboard/scan/${result.id}`)}
                  className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  Full Report <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const url = `/api/report/pdf?scanId=${result.id}`;
                    window.open(url, "_blank");
                  }}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
