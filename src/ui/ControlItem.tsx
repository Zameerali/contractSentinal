"use client";

import React from "react";

interface ControlItemProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function ControlItem({
  title,
  description,
  children,
  className = "",
  icon,
}: ControlItemProps) {
  return (
    <div
      className={`flex items-start justify-between p-3 bg-gray-50 rounded-lg ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="text-subhead font-medium text-gray-900 truncate"
            title={typeof title === "string" ? title : undefined}
          >
            {title}
          </div>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
        {description && (
          <div
            className="text-body text-gray-700 mt-1 truncate"
            title={
              typeof description === "string"
                ? (description as string)
                : undefined
            }
          >
            {description}
          </div>
        )}
      </div>

      <div className="ml-4">{children}</div>
    </div>
  );
}
