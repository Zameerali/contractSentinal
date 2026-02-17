"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  ArrowUpIcon,
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

export default function AdminPage() {
  const { authFetch, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "scans">("overview");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [tab, userPage]);

  const loadData = async () => {
    try {
      const res = await authFetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await authFetch(`/api/admin/users?page=${userPage}`);
      const data = await res.json();
      setUsers(data.users || []);
      setUserTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await authFetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      loadUsers();
    } catch (err) {
      console.error("Failed to perform action:", err);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldExclamationIcon className="mb-4 h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold text-white">Access Denied</p>
        <p className="text-sm text-zinc-500">Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">
            System overview and management
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-900 p-1 border border-zinc-800">
        {(["overview", "users", "scans"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === t
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={UsersIcon}
              label="Total Users"
              value={stats.stats.totalUsers}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <StatCard
              icon={MagnifyingGlassIcon}
              label="Total Scans"
              value={stats.stats.totalScans}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
            />
            <StatCard
              icon={ChartBarIcon}
              label="Scans (24h)"
              value={stats.stats.scansLast24h}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
            />
            <StatCard
              icon={ShieldExclamationIcon}
              label="High Risk"
              value={stats.stats.highRiskScans}
              color="text-red-400"
              bgColor="bg-red-500/10"
            />
          </div>

          {/* Verdict distribution */}
          {stats.verdictCounts?.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
                Verdict Distribution
              </h3>
              <div className="space-y-3">
                {stats.verdictCounts.map((v: any, i: number) => {
                  const total = stats.stats.totalScans || 1;
                  const pct = Math.round((v.count / total) * 100);
                  const isRisky =
                    v.verdict?.toUpperCase().includes("HIGH") ||
                    v.verdict?.toUpperCase().includes("SCAM");
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">{v.verdict}</span>
                        <span className="text-zinc-500">
                          {v.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isRisky ? "bg-red-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent high risk */}
          {stats.recentHighRisk?.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <div className="border-b border-zinc-800 p-5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Recent High-Risk Scans
                </h3>
              </div>
              <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
                {stats.recentHighRisk.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="text-sm font-mono text-zinc-300">
                        {s.contractAddress?.slice(0, 16)}...
                      </p>
                      <p className="text-xs text-zinc-600">
                        {s.user?.email} ·{" "}
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-red-500/20">
                      {s.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily scans chart (simple bars) */}
          {stats.chartData?.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
                Scans (Last 30 Days)
              </h3>
              <div className="flex items-end gap-1 h-40">
                {stats.chartData.map((d: any, i: number) => {
                  const max = Math.max(
                    ...stats.chartData.map((x: any) => x.scans),
                    1,
                  );
                  const height = d.scans > 0 ? (d.scans / max) * 100 : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 group relative flex flex-col justify-end h-full"
                      title={`${d.date}: ${d.scans} scans`}
                    >
                      {d.scans > 0 ? (
                        <div
                          className="w-full rounded-t bg-emerald-500/60 hover:bg-emerald-400 transition-colors cursor-default"
                          style={{ height: `${height}%` }}
                        />
                      ) : (
                        <div
                          className="w-full bg-zinc-800 rounded-t"
                          style={{ height: "2px" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                <span>{stats.chartData[0]?.date}</span>
                <span>{stats.chartData[stats.chartData.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-800 max-h-[calc(100vh-280px)] overflow-y-auto">
                {users.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                        {u.name?.[0]?.toUpperCase() ||
                          u.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {u.name || u.email}
                          </p>
                          {u.role === "ADMIN" && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                              ADMIN
                            </span>
                          )}
                          {u.banned && (
                            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                              BANNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">
                          {u.email} · {u._count?.scans || 0} scans
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.id !== user?.id && (
                        <>
                          <button
                            onClick={() =>
                              handleUserAction(u.id, u.banned ? "unban" : "ban")
                            }
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                              u.banned
                                ? "border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {u.banned ? "Unban" : "Ban"}
                          </button>
                          <button
                            onClick={() =>
                              handleUserAction(
                                u.id,
                                u.role === "ADMIN" ? "demote" : "promote",
                              )
                            }
                            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-white"
                          >
                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {Math.ceil(userTotal / 20) > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-zinc-800 p-4">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage(userPage - 1)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-zinc-500">Page {userPage}</span>
                  <button
                    disabled={userPage >= Math.ceil(userTotal / 20)}
                    onClick={() => setUserPage(userPage + 1)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "scans" && <AdminScansTab authFetch={authFetch} />}
    </div>
  );
}

function AdminScansTab({ authFetch }: { authFetch: any }) {
  const [scans, setScans] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, [page]);

  const loadScans = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/scans?page=${page}`);
      const data = await res.json();
      setScans(data.scans || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load scans:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      await authFetch("/api/admin/scans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      loadScans();
    } catch (err) {
      console.error("Failed to delete scan:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="divide-y divide-zinc-800 max-h-[calc(100vh-280px)] overflow-y-auto">
        {scans.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {s.contractName || s.contractAddress?.slice(0, 16) + "..."}
              </p>
              <p className="text-xs text-zinc-600">
                {s.user?.email} · {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-400">
                {s.riskScore}%
              </span>
              <button
                onClick={() => deleteScan(s.id)}
                className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
