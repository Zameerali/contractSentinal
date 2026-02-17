"use client";

import React from "react";
import { clsx } from "clsx";

interface SyncBadgeProps {
  status: string;
  className?: string;
  variant?: "default" | "text"; 
}

export function SyncBadge({ status, className, variant = "default" }: SyncBadgeProps) {
  const s = (status || "Ok").toString();
  const lower = s.toLowerCase();

  const positiveKeywords = ["ok", "up to date", "up-to-date", "syn ok", "sync ok", "up to date"];
  const warningKeywords = ["paused", "pause"];
  const negativeKeywords = ["issue", "error", "failed", "problem"];

  const isPositive = positiveKeywords.some((k) => lower.includes(k));
  const isWarning = warningKeywords.some((k) => lower.includes(k));
  const isNegative = negativeKeywords.some((k) => lower.includes(k));

  const bgClass = isPositive ? "bg-green-50 text-green-800" : isWarning ? "bg-yellow-50 text-yellow-800" : isNegative ? "bg-red-50 text-red-800" : "bg-red-50 text-red-800";

  const dotClass = isPositive ? "bg-green-400" : isWarning ? "bg-yellow-400" : "bg-red-400";

  let displayText = s;
  if (variant === "text") {
    displayText = isPositive ? "In Sync" : isWarning ? "Paused" : isNegative ? "Out of Sync" : "Unknown";
  }

  return (
    <div className="flex justify-left">
      <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-body font-medium", bgClass, className)}>
        <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", dotClass)} />
        {displayText}
      </span>
    </div>
  );
}

export default SyncBadge;
