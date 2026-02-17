"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import RiskGauge from "@/components/RiskGauge";
import { Select } from "@/ui/select";
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} ring-1 ring-white/5`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, authFetch } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, safe: 0, risky: 0 });

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const res = await authFetch("/api/scan?limit=5");
      const data = await res.json();
      if (data.scans) {
        setRecentScans(data.scans);
        const total = data.total || 0;
        const safe = data.scans.filter((s: any) => s.riskScore <= 25).length;
        const risky = data.scans.filter((s: any) => s.riskScore > 70).length;
        setStats({ total, safe, risky });
      }
    } catch (err) {
      console.error("Failed to load scans:", err);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) return;
    setScanning(true);
    setScanResult(null);

    try {
      const res = await authFetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: address, chain }),
      });
      const data = await res.json();
      if (data.error) {
        setScanResult({ error: data.error });
      } else {
        setScanResult(data.scan || data);
        loadRecentScans();
      }
    } catch (err: any) {
      setScanResult({ error: err.message });
    } finally {
      setScanning(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    if (!verdict)
      return {
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        ring: "ring-zinc-500/20",
      };
    const v = verdict.toUpperCase();
    if (v.includes("SAFE") || v.includes("LOW"))
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        ring: "ring-emerald-500/20",
      };
    if (v.includes("MEDIUM") || v.includes("CAUTION"))
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        ring: "ring-amber-500/20",
      };
    return {
      bg: "bg-red-500/10",
      text: "text-red-400",
      ring: "ring-red-500/20",
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back,{" "}
          <span className="text-emerald-400">
            {user?.name || user?.email?.split("@")[0]}
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Scan smart contracts and protect your assets
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={MagnifyingGlassIcon}
          label="Total Scans"
          value={stats.total}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Safe Contracts"
          value={stats.safe}
          color="text-cyan-400"
          bgColor="bg-cyan-500/10"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="High Risk"
          value={stats.risky}
          color="text-red-400"
          bgColor="bg-red-500/10"
        />
      </div>

      {/* Scan Form */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Scan</h2>
        <form onSubmit={handleScan} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contract address (0x...)"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <Select
            value={chain}
            onChange={setChain}
            options={[
              { value: "1", label: "Ethereum" },
              { value: "137", label: "Polygon" },
              { value: "42161", label: "Arbitrum" },
              { value: "10", label: "Optimism" },
              { value: "56", label: "BNB Chain" },
            ]}
          />
          <button
            type="submit"
            disabled={scanning || !address.match(/^0x[a-fA-F0-9]{40}$/)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {scanning ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5" />
                Scan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden animate-fade-in">
          {scanResult.error ? (
            <div className="flex items-center gap-3 p-6">
              <XCircleIcon className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{scanResult.error}</p>
            </div>
          ) : (
            <div>
              {/* Result header */}
              <div className="flex flex-col items-center gap-6 p-8 sm:flex-row">
                <RiskGauge score={scanResult.riskScore || 0} size={180} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        getVerdictStyle(scanResult.verdict).bg
                      } ${getVerdictStyle(scanResult.verdict).text} ${getVerdictStyle(scanResult.verdict).ring}`}
                    >
                      {scanResult.verdict}
                    </span>
                    {scanResult.contractName && (
                      <span className="text-sm font-medium text-zinc-300">
                        {scanResult.contractName}
                      </span>
                    )}
                  </div>
                  <p className="mb-1 text-xs text-zinc-500 font-mono">
                    {scanResult.contractAddress}
                  </p>
                  {(scanResult.summary || scanResult.explanation) && (
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                      {scanResult.summary || scanResult.explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Findings */}
              {scanResult.findings && scanResult.findings.length > 0 && (
                <div className="border-t border-zinc-800 p-6">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                    Findings
                  </h3>
                  <div className="space-y-2">
                    {scanResult.findings.map((f: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 rounded-xl p-3 ${
                          f.severity === "critical" || f.severity === "high"
                            ? "bg-red-500/5 border border-red-500/10"
                            : f.severity === "medium"
                              ? "bg-amber-500/5 border border-amber-500/10"
                              : "bg-zinc-800/50 border border-zinc-700/50"
                        }`}
                      >
                        <ExclamationTriangleIcon
                          className={`h-5 w-5 shrink-0 ${
                            f.severity === "critical" || f.severity === "high"
                              ? "text-red-400"
                              : f.severity === "medium"
                                ? "text-amber-400"
                                : "text-zinc-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {f.title || f.pattern}
                          </p>
                          {f.description && (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {f.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-800 p-4">
                <button
                  onClick={() =>
                    router.push(`/dashboard/scan/${scanResult.id}`)
                  }
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View Full Report <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Scans */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
          <button
            onClick={() => router.push("/dashboard/history")}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            View All <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <MagnifyingGlassIcon className="mb-3 h-10 w-10" />
            <p className="text-sm">
              No scans yet. Start by scanning a contract above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentScans.map((scan: any) => {
              const style = getVerdictStyle(scan.verdict);
              return (
                <button
                  key={scan.id}
                  onClick={() => router.push(`/dashboard/scan/${scan.id}`)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg}`}
                    >
                      {scan.riskScore <= 25 ? (
                        <CheckCircleIcon className={`h-5 w-5 ${style.text}`} />
                      ) : (
                        <ExclamationTriangleIcon
                          className={`h-5 w-5 ${style.text}`}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {scan.contractName ||
                          scan.contractAddress.slice(0, 10) +
                            "..." +
                            scan.contractAddress.slice(-6)}
                      </p>
                      <p className="text-xs text-zinc-600 font-mono">
                        {scan.contractAddress.slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${style.bg} ${style.text} ${style.ring}`}
                    >
                      {scan.riskScore}%
                    </span>
                    <span className="text-xs text-zinc-600">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
