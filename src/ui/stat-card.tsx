"use client";

import React from "react";
import { clsx } from "clsx";

interface StatCardProps {
  iconSrc?: string;
  icon?: React.ReactNode;
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  iconBgClass?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  iconSrc,
  icon,
  title,
  value,
  subtitle,
  iconBgClass = "bg-purple-25",
  className,
  valueClassName,
}: StatCardProps) {
  return (
    <div
      className={clsx(
        "bg-background dark:bg-background rounded-lg px-3 md:px-4 border border-gray-200 dark:border-gray-200",
        "flex items-center gap-3 md:gap-4 min-h-[70px] md:min-h-[89px]",
        className
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-lg flex-shrink-0",
          iconBgClass
        )}
      >
        {iconSrc ? (
          <img src={iconSrc} alt={title} className="w-4 h-4 md:w-6 md:h-6" />
        ) : (
          <span className="text-white [&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-6 md:[&>svg]:h-6">{icon}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-gray-500 text-xs md:text-subhead font-medium mt-1 truncate">
          {title}
        </div>
        <div
          className={clsx(
            "text-gray-900 text-lg md:text-heading-h1 font-semibold",
            valueClassName
          )}
        >
          {/* value wrapper: constrained width, allow wrap; keep the slash+second number together but truncate if necessary */}
          <div className="flex flex-wrap items-baseline gap-2 content-start min-w-0 w-full overflow-hidden">
            {React.isValidElement(value) ? (
              (() => {
                const el = value as React.ReactElement<any>;
                const children = React.Children.toArray(el.props.children);
                return children.map((child, idx) =>
                  idx === 1 ? (
                    <span
                      key={idx}
                      className="min-w-0 break-words inline-block"
                    >
                      {child}
                    </span>
                  ) : (
                    <span
                      key={idx}
                      className="min-w-0 break-words inline-block"
                    >
                      {child}
                    </span>
                  )
                );
              })()
            ) : (
              <span className="min-w-0 break-words inline-block">{value}</span>
            )}
          </div>
        </div>
        {subtitle && (
          <div className="text-primary text-body font-medium">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
