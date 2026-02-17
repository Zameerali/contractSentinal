"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Select } from "@/ui/select";
import { Heading } from "@/ui/heading";
import { Text } from "@/ui/text";
import {
  ShieldExclamationIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export default function AuditLogsPage() {
  const { authFetch, user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, [page, filter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/audit-logs?page=${page}`;
      if (filter) url += `&action=${encodeURIComponent(filter)}`;
      const res = await authFetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldExclamationIcon className="mb-4 h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold text-white">Access Denied</p>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes("LOGIN") || action.includes("REGISTER"))
      return "text-emerald-400 bg-emerald-500/10";
    if (action.includes("SCAN")) return "text-cyan-400 bg-cyan-500/10";
    if (action.includes("BAN") || action.includes("DELETE"))
      return "text-red-400 bg-red-500/10";
    if (action.includes("ADMIN")) return "text-amber-400 bg-amber-500/10";
    return "text-zinc-400 bg-zinc-500/10";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <Heading level={2} className="!text-lg">
            Audit Logs
          </Heading>
          <Text className="mt-0.5">{total} total events</Text>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Select
            value={filter}
            onChange={(val) => {
              setFilter(val);
              setPage(1);
            }}
            className="w-40 sm:w-48"
            options={[
              { value: "", label: "All Actions" },
              { value: "LOGIN", label: "Login" },
              { value: "REGISTER", label: "Register" },
              { value: "SCAN", label: "Scan" },
              { value: "LOGOUT", label: "Logout" },
            ]}
          />
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="divide-y divide-zinc-800 overflow-y-auto flex-1">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                  <div>
                    <p className="text-sm text-zinc-300">
                      {log.user?.email || "System"}
                    </p>
                    {log.target && (
                      <p className="text-xs text-zinc-600 font-mono">
                        {log.target.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.ipAddress && (
                    <p className="text-[10px] text-zinc-700">{log.ipAddress}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Math.ceil(total / 50) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-xs text-zinc-500">
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 50)}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
