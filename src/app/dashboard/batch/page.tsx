"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Select } from "@/ui/select";
import { Heading, Subheading } from "@/ui/heading";
import { Text } from "@/ui/text";
import {
  RectangleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function BatchScanPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<string[]>([""]);
  const [chain, setChain] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  const addAddress = () => {
    if (addresses.length < 10) setAddresses([...addresses, ""]);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const updateAddress = (index: number, value: string) => {
    const updated = [...addresses];
    updated[index] = value;
    setAddresses(updated);
  };

  const validAddresses = addresses.filter((a) =>
    a.match(/^0x[a-fA-F0-9]{40}$/),
  );

  const handleBatchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validAddresses.length === 0) return;
    setScanning(true);
    setError("");
    setResults([]);

    try {
      const res = await authFetch("/api/batch-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: validAddresses, chain }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    if (!verdict) return { bg: "bg-zinc-500/10", text: "text-zinc-400" };
    const v = verdict.toUpperCase();
    if (v.includes("SAFE") || v.includes("LOW"))
      return { bg: "bg-emerald-500/10", text: "text-emerald-400" };
    if (v.includes("MEDIUM") || v.includes("CAUTION"))
      return { bg: "bg-amber-500/10", text: "text-amber-400" };
    return { bg: "bg-red-500/10", text: "text-red-400" };
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2} className="!text-lg">
          Batch Scan
        </Heading>
        <Text className="mt-0.5">Scan up to 10 contracts at once</Text>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <form onSubmit={handleBatchScan} className="space-y-4">
          <div className="space-y-3">
            {addresses.map((addr, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500 font-mono">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={addr}
                  onChange={(e) => updateAddress(i, e.target.value)}
                  placeholder="0x..."
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
                {addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-red-500/30 hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {addresses.length < 10 && (
            <button
              type="button"
              onClick={addAddress}
              className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400"
            >
              <PlusIcon className="h-4 w-4" />
              Add Address ({addresses.length}/10)
            </button>
          )}

          <Select
            value={chain}
            onChange={(val) => setChain(val)}
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
            disabled={scanning || validAddresses.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Scanning {validAddresses.length} contracts...
              </>
            ) : (
              <>
                <RectangleStackIcon className="h-5 w-5" />
                Scan {validAddresses.length} Contract
                {validAddresses.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <XCircleIcon className="mr-2 inline h-5 w-5" />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Results ({results.length})
          </h2>
          {results.map((r: any, i: number) => {
            if (r.error) {
              return (
                <div
                  key={i}
                  className="rounded-xl border border-red-500/20 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500 font-mono">
                        {r.contractAddress}
                      </p>
                      <p className="text-sm text-red-400">{r.error}</p>
                    </div>
                  </div>
                </div>
              );
            }
            const style = getVerdictStyle(r.verdict);
            return (
              <button
                key={i}
                onClick={() => router.push(`/dashboard/scan/${r.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.bg}`}
                  >
                    {r.riskScore <= 25 ? (
                      <CheckCircleIcon className={`h-5 w-5 ${style.text}`} />
                    ) : (
                      <ExclamationTriangleIcon
                        className={`h-5 w-5 ${style.text}`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {r.contractName || "Unknown"}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {r.contractAddress.slice(0, 16)}...
                      {r.contractAddress.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}
                  >
                    {r.verdict}
                  </span>
                  <span className="text-lg font-bold text-zinc-300">
                    {r.riskScore}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
