"use client";

import React from "react";
import { clsx } from "clsx";

interface OnlineBadgeProps {
  status: "Online" | "Offline" | string;
  className?: string;
}

export function OnlineBadge({ status, className }: OnlineBadgeProps) {
  const s = (status || "Offline").toString();
  const isOnline = s.toLowerCase().includes("online");

  const bgClass = isOnline
    ? "bg-green-50 text-green-800"
    : "bg-gray-50 text-gray-500";
  const dotClass = isOnline ? "bg-success-500" : "bg-gray-500";

  return (
    <div className="flex justify-center">
      <span
        className={clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-body font-medium",
          bgClass,
          className
        )}
      >
        <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", dotClass)} />
        {s}
      </span>
    </div>
  );
}

export default OnlineBadge;
