"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Select } from "@/ui/select";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export default function HistoryPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadScans();
  }, [page, filter]);

  const loadScans = async () => {
    setLoading(true);
    try {
      let url = `/api/scan?page=${page}&limit=15`;
      if (filter) url += `&verdict=${encodeURIComponent(filter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await authFetch(url);
      const data = await res.json();
      setScans(data.scans || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
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

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <Heading level={2} className="!text-lg">
            Scan History
          </Heading>
          <Text className="mt-0.5">{total} total scans</Text>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadScans()}
              placeholder="Search address..."
              className="w-full sm:w-56 rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <Select
            value={filter}
            onChange={(val) => {
              setFilter(val);
              setPage(1);
            }}
            className="w-44"
            options={[
              { value: "", label: "All Verdicts" },
              { value: "SAFE", label: "Safe" },
              { value: "LOW RISK", label: "Low Risk" },
              { value: "MEDIUM RISK", label: "Medium Risk" },
              { value: "HIGH RISK", label: "High Risk" },
              { value: "KNOWN SCAM", label: "Known Scam" },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 py-16 text-zinc-600">
            <ClockIcon className="mb-3 h-10 w-10" />
            <p className="text-sm">No scans found</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="divide-y divide-zinc-800">
              {scans.map((scan: any) => {
                const style = getVerdictStyle(scan.verdict);
                return (
                  <button
                    key={scan.id}
                    onClick={() => router.push(`/dashboard/scan/${scan.id}`)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
                      >
                        {scan.riskScore <= 25 ? (
                          <CheckCircleIcon
                            className={`h-5 w-5 ${style.text}`}
                          />
                        ) : (
                          <ExclamationTriangleIcon
                            className={`h-5 w-5 ${style.text}`}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {scan.contractName || scan.contractAddress}
                        </p>
                        <p className="text-xs text-zinc-600 font-mono truncate">
                          {scan.contractAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 ml-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${style.bg} ${style.text} ${style.ring}`}
                      >
                        {scan.verdict || "Unknown"}
                      </span>
                      <span className="text-lg font-bold text-zinc-400 tabular-nums w-12 text-right">
                        {scan.riskScore}%
                      </span>
                      <span className="hidden text-xs text-zinc-600 sm:block w-24 text-right">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-zinc-800 px-4 py-4 mt-0 flex-shrink-0">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-4 text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-600 hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
