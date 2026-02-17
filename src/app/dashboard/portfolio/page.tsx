"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Select } from "@/ui/select";
import { Heading, Subheading } from "@/ui/heading";
import { Text } from "@/ui/text";
import {
  FolderIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function PortfolioPage() {
  const { authFetch } = useAuth();
  const [walletAddress, setWalletAddress] = useState("");
  const [chain, setChain] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) return;
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const res = await authFetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, chainId: chain }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const downloadPortfolioReport = () => {
    if (!result) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ContractSentinel Portfolio Report - ${result.walletAddress}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #09090b; color: #d4d4d8; padding: 40px; max-width: 1000px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #27272a; }
    .logo { font-size: 28px; font-weight: 800; }
    .logo span { color: #10b981; }
    .subtitle { color: #71717a; font-size: 14px; margin-top: 8px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 16px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #27272a; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .summary-item { padding: 16px; border: 1px solid #27272a; border-radius: 8px; }
    .summary-label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }
    .summary-value { font-size: 28px; font-weight: 700; color: #10b981; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { border-bottom: 2px solid #27272a; padding: 12px; text-align: left; font-weight: 700; color: #ffffff; }
    td { border-bottom: 1px solid #27272a; padding: 12px; }
    tr:hover { background: #18181b; }
    .risk-bar { height: 8px; background: #27272a; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .risk-fill { height: 100%; border-radius: 4px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #52525b; }
    @media print {
      body { background: white; color: #1f2937; }
      .summary-item { border: 1px solid #e5e7eb; }
      .summary-value { color: #059669; }
      th { border-bottom: 2px solid #d1d5db; }
      td { border-bottom: 1px solid #d1d5db; }
      tr:hover { background: white; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Contract<span>Sentinel</span></div>
    <div class="subtitle">Portfolio Security Analysis Report</div>
  </div>

  <div class="section">
    <div class="section-title">Portfolio Summary</div>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Wallet Address</div>
        <div style="font-family: monospace; font-size: 12px; margin-top: 8px; word-break: break-all;">${result.walletAddress}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Average Risk Score</div>
        <div class="summary-value">${result.averageRisk}/100</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Scanned</div>
        <div class="summary-value">${result.totalScanned}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">High Risk Tokens</div>
        <div class="summary-value" style="color: #ef4444;">${result.highRiskCount}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Token Holdings</div>
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Contract Address</th>
          <th>Risk Score</th>
          <th>Verdict</th>
        </tr>
      </thead>
      <tbody>
        ${result.holdings
          ?.map(
            (h: any) => `
        <tr>
          <td><strong>${h.symbol || "UNKNOWN"}</strong><br/>${h.name || ""}</td>
          <td style="font-family: monospace; font-size: 11px;">${h.contractAddress?.slice(0, 20)}...${h.contractAddress?.slice(-8)}</td>
          <td>
            <strong>${h.riskScore || "N/A"}/100</strong>
            <div class="risk-bar">
              <div class="risk-fill" style="width: ${h.riskScore || 0}%; background: ${
                (h.riskScore || 0) <= 25
                  ? "#10b981"
                  : (h.riskScore || 0) <= 50
                    ? "#06b6d4"
                    : (h.riskScore || 0) <= 70
                      ? "#f59e0b"
                      : "#ef4444"
              };"></div>
            </div>
          </td>
          <td>${h.verdict || (h.riskScore <= 25 ? "SAFE" : h.riskScore <= 60 ? "MEDIUM" : "HIGH RISK")}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by ContractSentinel · ${new Date().toISOString()}</p>
    <p style="margin-top: 4px;">This report is for informational purposes only. Not financial advice.</p>
    <p style="margin-top: 8px; font-size: 11px;">To save as PDF: Press Ctrl+P (or Cmd+P) → Save as PDF</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ContractSentinel-Portfolio-${result.walletAddress?.slice(-8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return "text-emerald-400";
    if (score <= 50) return "text-cyan-400";
    if (score <= 70) return "text-amber-400";
    return "text-red-400";
  };

  const getRiskBg = (score: number) => {
    if (score <= 25) return "bg-emerald-500";
    if (score <= 50) return "bg-cyan-500";
    if (score <= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2} className="!text-lg">
          Portfolio Scanner
        </Heading>
        <Text className="mt-0.5">
          Scan all token holdings in a wallet for security risks
        </Text>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <form onSubmit={handleScan} className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Wallet address (0x...)"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <Select
              value={chain}
              onChange={(val) => setChain(val)}
              className="sm:w-44"
              options={[
                { value: "1", label: "Ethereum" },
                { value: "137", label: "Polygon" },
                { value: "42161", label: "Arbitrum" },
                { value: "10", label: "Optimism" },
                { value: "56", label: "BNB Chain" },
              ]}
            />
          </div>
          <button
            type="submit"
            disabled={scanning || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Scanning Portfolio...
              </>
            ) : (
              <>
                <FolderIcon className="h-5 w-5" />
                Scan Portfolio
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Portfolio summary */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  Portfolio Risk Summary
                </h2>
                <p className="mt-1 text-xs text-zinc-500 font-mono">
                  {result.walletAddress}
                </p>
              </div>
              <div className="text-center">
                <p
                  className={`text-4xl font-black ${getRiskColor(result.averageRisk)}`}
                >
                  {result.averageRisk}
                </p>
                <p className="text-xs text-zinc-500">Avg Risk Score</p>
              </div>
            </div>

            {/* Risk bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getRiskBg(result.averageRisk)}`}
                  style={{ width: `${result.averageRisk}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                <span>Safe</span>
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Critical</span>
              </div>
            </div>

            {/* Download button */}
            <div className="mt-6 flex">
              <button
                onClick={downloadPortfolioReport}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Holdings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="border-b border-zinc-800 p-5">
              <h2 className="text-lg font-semibold text-white">
                Token Holdings ({result.holdings?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-zinc-800 max-h-[calc(100vh-280px)] overflow-y-auto">
              {result.holdings?.map((h: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${h.riskScore <= 25 ? "bg-emerald-500/10" : h.riskScore <= 70 ? "bg-amber-500/10" : "bg-red-500/10"}`}
                    >
                      {h.riskScore <= 25 ? (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ExclamationTriangleIcon
                          className={`h-5 w-5 ${h.riskScore <= 70 ? "text-amber-400" : "text-red-400"}`}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {h.symbol || h.name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">
                        {h.contractAddress?.slice(0, 12)}...
                        {h.contractAddress?.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${getRiskColor(h.riskScore)}`}
                      >
                        {h.riskScore}%
                      </p>
                      <p className="text-xs text-zinc-600">
                        {h.verdict || "Scanned"}
                      </p>
                    </div>
                    <div className="h-2 w-16 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskBg(h.riskScore)}`}
                        style={{ width: `${h.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
