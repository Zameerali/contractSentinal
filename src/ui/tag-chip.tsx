"use client";

import React from "react";
import clsx from "clsx";

interface TagChipProps {
  label: string;
  className?: string;
}

export function TagChip({ label, className }: TagChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-body font-medium",
        "bg-gray-100 text-gray-600",
        className
      )}
    >
      {label}
    </span>
  );
}

export default TagChip;
