"use client";

import React from "react";
import clsx from "clsx";

interface ConnectionSignalProps {
  // strength: number of filled bars (0-3). If not provided, derives from status.
  strength?: number;
  // status can be used instead of strength: "Online" | "Offline" | "Paused"
  status?: "Online" | "Offline" | "Paused" | string;
  className?: string;
}

export function ConnectionSignal({ strength, status, className }: ConnectionSignalProps) {
  let filled = 0;
  if (typeof strength === "number") {
    filled = Math.max(0, Math.min(3, Math.trunc(strength)));
  } else if (status) {
    // defaults: Online -> 3, Paused -> 1, Offline -> 0
    if (status === "Online") filled = 3;
    else if (status === "Paused") filled = 1;
    else filled = 0;
  }

  const bars = [1, 2, 3];

  return (
    <div className={clsx("flex items-end gap-0.5", className)}>
      {bars.map((b) => {
        const isFilled = b <= filled;
        const heightClass = b === 1 ? "h-3.5" : b === 2 ? "h-4.5" : "h-5.5";
        return (
          <span
            key={b}
            className={clsx(
              "w-[6px] rounded-sm",
              heightClass,
              isFilled ? "bg-teal-500" : "bg-[#D9D9D9]"
            )}
          />
        );
      })}
    </div>
  );
}

export default ConnectionSignal;
