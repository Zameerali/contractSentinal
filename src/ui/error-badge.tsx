"use client";

import React from "react";
import clsx from "clsx";

interface ErrorBadgeProps {
  count?: number | string | null;
  className?: string;
}

export function ErrorBadge({ count, className }: ErrorBadgeProps) {
  const hasCount = typeof count === "number" ? count > 0 : !!count;

  // When there's no count (0, null, undefined, empty), render a simple centered dash
  if (!hasCount) {
    return (
      <div className={clsx("flex items-center justify-center h-7 w-7", className)}>
        <span className="text-red-600">-</span>
      </div>
    );
  }

  const display = String(count);

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-start px-3 py-1 rounded-md bg-red-50 border border-red-300 h-7 min-w-[28px]",
        className
      )}
    >
      <span className="text-red-600 font-semibold">{display}</span>
    </div>
  );
}

export default ErrorBadge;
