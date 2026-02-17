"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  icon,
}: CollapsibleSectionProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h4 className="text-title font-semibold text-gray-900">{title}</h4>
        </div>
        <ChevronDown
          className={clsx(
            "w-6 h-6 flex items-center justify-center rounded-md bg-purple-25 text-gray-900 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="w-full bg-white mt-3 rounded-lg space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
