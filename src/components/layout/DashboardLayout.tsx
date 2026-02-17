"use client";

import React, { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  ShieldCheckIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  FolderIcon,
  RectangleStackIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Scan Contract", href: "/dashboard/scan", icon: MagnifyingGlassIcon },
  { name: "Batch Scan", href: "/dashboard/batch", icon: RectangleStackIcon },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: FolderIcon },
  { name: "History", href: "/dashboard/history", icon: ClockIcon },
];

const adminNav = [
  { name: "Admin Panel", href: "/dashboard/admin", icon: CogIcon },
  {
    name: "Audit Logs",
    href: "/dashboard/admin/audit",
    icon: ShieldExclamationIcon,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 animate-slide-up">
            <SidebarContent
              pathname={pathname}
              isActive={isActive}
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col">
        <SidebarContent
          pathname={pathname}
          isActive={isActive}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white">
                  {navigation.find((n) => isActive(n.href))?.name ||
                    adminNav.find((n) => isActive(n.href))?.name ||
                    "ContractSentinel"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-400">Ethereum Mainnet</span>
              </div>

              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <span className="hidden sm:block">
                    {user?.name || user?.email?.split("@")[0]}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-2xl group-hover:block">
                  <div className="px-3 py-2 text-xs text-zinc-500">
                    {user?.email}
                  </div>
                  <div className="border-t border-zinc-800" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  isActive,
  user,
  onLogout,
  onClose,
}: {
  pathname: string;
  isActive: (href: string) => boolean;
  user: any;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <ShieldCheckSolid className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white">Contract</span>
            <span className="text-base font-bold text-emerald-400">
              Sentinel
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Main
        </div>
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${active ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
              />
              {item.name}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <>
            <div className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Administration
            </div>
            {adminNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/5"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-xl bg-zinc-800/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
