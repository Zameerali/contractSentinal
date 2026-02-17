"use client";

import React from "react";
import clsx from "clsx";

interface WarningBadgeProps {
  count?: number | string | null;
  className?: string;
}

export function WarningBadge({ count, className }: WarningBadgeProps) {
  const hasCount = typeof count === "number" ? count > 0 : !!count;

  if (!hasCount) {
    return (
      <div className={clsx("flex items-center justify-center h-7 w-7", className)}>
        <span className="text-orange-600">-</span>
      </div>
    );
  }

  const display = String(count);

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-start px-3 py-1 rounded-md bg-orange-50 border border-orange-300 h-7 min-w-[28px]",
        className
      )}
    >
      <span className="text-yellow-600 font-semibold">{display}</span>
    </div>
  );
}

export default WarningBadge;
