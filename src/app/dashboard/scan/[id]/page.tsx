"use client";

import React, { useEffect, useState, use } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import RiskGauge from "@/components/RiskGauge";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { authFetch } = useAuth();
  const router = useRouter();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScan();
  }, [id]);

  const loadScan = async () => {
    try {
      const res = await authFetch(`/api/scan?id=${id}`);
      const data = await res.json();
      if (data.id) {
        setScan(data);
      }
    } catch (err) {
      console.error("Failed to load scan:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await authFetch(`/api/report/pdf?scanId=${scan.id}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const html = await res.text();

      // Create a blob and download
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ContractSentinel-Report-${scan.contractAddress?.slice(-8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report download failed:", err);
      alert("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <p className="text-lg font-medium">Scan not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
        >
          Go back
        </button>
      </div>
    );
  }

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

  const style = getVerdictStyle(scan.verdict);
  const findings = scan.findings || [];
  const summary = scan.summary || scan.explanation || "";
  const recommendations: string[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Report</h1>
          <p className="text-sm text-zinc-500">Detailed analysis results</p>
        </div>
      </div>

      {/* Honeypot warning */}
      {scan.riskScore >= 85 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="pump-animation inline-flex items-center justify-center">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">
                ⚠️ HONEYPOT / CRITICAL RISK
              </p>
              <p className="text-sm text-red-400/70">
                This contract has been flagged as extremely dangerous. DO NOT
                INVEST.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk gauge card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center justify-center">
          <RiskGauge score={scan.riskScore || 0} size={200} />
          <div className="mt-4 text-center">
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${style.bg} ${style.text} ${style.border}`}
            >
              {scan.verdict}
            </span>
          </div>
        </div>

        {/* Contract details */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Contract Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-500">Contract Name</p>
              <p className="text-sm font-medium text-white">
                {scan.contractName || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Chain</p>
              <p className="text-sm font-medium text-white">
                {(
                  {
                    1: "Ethereum",
                    137: "Polygon",
                    42161: "Arbitrum",
                    10: "Optimism",
                    56: "BNB Chain",
                  } as Record<number, string>
                )[scan.chainId] || "Unknown"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-zinc-500">Address</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-zinc-300 break-all">
                  {scan.contractAddress}
                </p>
                <a
                  href={`${({ 1: "https://etherscan.io", 137: "https://polygonscan.com", 42161: "https://arbiscan.io", 10: "https://optimistic.etherscan.io", 56: "https://bscscan.com" } as Record<number, string>)[scan.chainId] || "https://etherscan.io"}/address/${scan.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 shrink-0"
                >
                  <LinkIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Risk Score</p>
              <p className={`text-2xl font-bold ${style.text}`}>
                {scan.riskScore}/100
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Scanned At</p>
              <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                <ClockIcon className="h-4 w-4 text-zinc-500" />
                {new Date(scan.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {summary && (
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500 mb-1">Summary</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Security Findings ({findings.length})
          </h2>
          <div className="space-y-3">
            {findings.map((f: any, i: number) => {
              const sev = (f.severity || "info").toLowerCase();
              const colors =
                sev === "critical"
                  ? {
                      bg: "bg-red-500/10",
                      border: "border-red-500/20",
                      icon: "text-red-400",
                      badge: "bg-red-500 text-white",
                    }
                  : sev === "high"
                    ? {
                        bg: "bg-orange-500/10",
                        border: "border-orange-500/20",
                        icon: "text-orange-400",
                        badge: "bg-orange-500 text-white",
                      }
                    : sev === "medium"
                      ? {
                          bg: "bg-amber-500/10",
                          border: "border-amber-500/20",
                          icon: "text-amber-400",
                          badge: "bg-amber-500 text-black",
                        }
                      : {
                          bg: "bg-zinc-800/50",
                          border: "border-zinc-700/50",
                          icon: "text-zinc-400",
                          badge: "bg-zinc-600 text-white",
                        };

              return (
                <div
                  key={i}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon
                      className={`h-5 w-5 shrink-0 mt-0.5 ${colors.icon}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-200">
                          {f.title || f.pattern}
                        </p>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${colors.badge}`}
                        >
                          {f.severity || "info"}
                        </span>
                      </div>
                      {f.description && (
                        <p className="mt-1 text-xs text-zinc-400">
                          {f.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Recommendations
          </h2>
          <div className="space-y-2">
            {recommendations.map((rec: string, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl bg-zinc-800/30 p-3"
              >
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-sm text-zinc-300">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Download Report
        </button>
        <button
          onClick={() => router.push("/dashboard/scan")}
          className="rounded-xl border border-zinc-700 px-6 py-3 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
        >
          New Scan
        </button>
      </div>
    </div>
  );
}
