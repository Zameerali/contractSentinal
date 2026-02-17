"use client";

import React from "react";
import { clsx } from "clsx";

interface PlayerCountProps {
  active: number;
  total: number;
  className?: string;
  activeClassName?: string;
  totalClassName?: string;
}

export function PlayerCount({
  active,
  total,
  className,
  activeClassName,
  totalClassName,
}: PlayerCountProps) {
  return (
    <div className={clsx("text-subhead text-left", className)}>
      <span className={clsx("text-gray-900 font-medium", activeClassName)}>
        {active}
      </span>
      <span className={clsx("text-gray-500 font-regular", totalClassName)}>
        /{total}
      </span>
    </div>
  );
}

export default PlayerCount;
