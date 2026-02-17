"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  heading?: string;
  description?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  legendItems?: Array<{ color: string; label: string }>;
}

export default function MetricCard({
  title,
  heading,
  description,
  children,
  isOpen = true,
  onToggle,
  legendItems,
}: MetricCardProps) {
  const [expanded, setExpanded] = useState(isOpen);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  return (
    <div className="w-full mb-4">
      {/* Collapsible Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-3 px-6 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col items-start">
          <h3 className="text-title font-semibold text-gray-900">{title}</h3>
        </div>
        <ChevronDown
          size={24}
          className={`w-6 h-6 flex items-center justify-center rounded-md bg-purple-25 text-gray-900 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className="w-full bg-white border border-gray-200 mt-3 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="flex-1">
                {heading && (
                  <p className="text-title text-gray-900 font-semibold">
                    {heading}
                  </p>
                )}
              </div>

              {legendItems && legendItems.length > 0 && (
                <div className="hidden sm:flex flex-shrink-0 flex-row gap-3">
                  {legendItems.map((item, idx) => {
                    const color = item.color || "";
                    const isCssColor =
                      color.startsWith("#") ||
                      color.startsWith("rgb") ||
                      color.startsWith("hsl");
                    const tailwindClass = !isCssColor
                      ? color.startsWith("bg-")
                        ? color
                        : `bg-${color}`
                      : "";

                    return (
                      <div key={idx} className="flex items-center gap-1">
                        {isCssColor ? (
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          ></div>
                        ) : (
                          <div
                            className={`${tailwindClass} w-2 h-2 rounded-full flex-shrink-0`}
                          />
                        )}
                        <span className="text-subhead text-gray-500 whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-subhead text-gray-500 mb-2">{description}</p>
            )}

            {/* Legend Dots Below (Visible on Mobile) */}
            {legendItems && legendItems.length > 0 && (
              <div className="sm:hidden flex flex-wrap gap-3">
                {legendItems.map((item, idx) => {
                  const color = item.color || "";
                  const isCssColor =
                    color.startsWith("#") ||
                    color.startsWith("rgb") ||
                    color.startsWith("hsl");
                  const tailwindClass = !isCssColor
                    ? color.startsWith("bg-")
                      ? color
                      : `bg-${color}`
                    : "";

                  return (
                    <div key={idx} className="flex items-center gap-1">
                      {isCssColor ? (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        ></div>
                      ) : (
                        <div
                          className={`${tailwindClass} w-2 h-2 rounded-full flex-shrink-0`}
                        />
                      )}
                      <span className="text-subhead text-gray-500">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart Content */}
          {children}
        </div>
      )}
    </div>
  );
}
