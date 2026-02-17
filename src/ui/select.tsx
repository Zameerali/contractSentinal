import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React, { forwardRef, useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  selectMenuPosition?: "top-full" | "bottom-full";
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLDivElement, CustomSelectProps>(
  function Select(
    {
      value,
      onChange,
      onOpenChange,
      options = [],
      placeholder = "Select option",
      className,
      menuClassName,
      disabled,
      children,
      selectMenuPosition,
    },
    ref,
  ) {
    const selectedOption = options.find((option) => option.value === value);
    const [isOpen, setIsOpen] = useState(false);

    // Notify parent when open state changes
    useEffect(() => {
      onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    return (
      <div className={clsx("relative", className)} ref={ref}>
        <Headless.Menu as="div" className="relative">
          {({ open }) => {
            // Track open state changes
            if (open !== isOpen) {
              setTimeout(() => setIsOpen(open), 0);
            }

            return (
              <>
                <span
                  data-slot="control"
                  className={clsx([
                    // Basic layout
                    "group relative block w-full",
                    // Hide light mode before pseudo
                    "dark:before:hidden",
                    // Disabled state
                    "has-data-disabled:opacity-50",
                  ])}
                >
                  <Headless.Menu.Button
                    disabled={disabled}
                    style={{
                      paddingLeft: selectedOption?.icon ? "0.5rem" : "0.5rem",
                    }}
                    className={clsx([
                      // Basic layout
                      "relative block w-full appearance-none rounded-lg py-2.5 pr-12 sm:pr-11",
                      "h-11",
                      // Typography
                      "text-left text-sm font-medium text-zinc-200 sm:text-sm/6 truncate",
                      // Border
                      "border border-zinc-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50",
                      // Background color
                      "bg-zinc-800/50 dark:bg-zinc-800/50",
                      // Hover state
                      "hover:border-zinc-600 transition-colors",
                      // Hide default focus styles
                      "focus:outline-hidden",
                      // Disabled state
                      "data-disabled:border-zinc-950/20 data-disabled:opacity-50 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5",
                    ])}
                  >
                    {selectedOption?.icon && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-400">
                        {selectedOption.icon}
                      </span>
                    )}
                    <span className="block truncate">
                      {selectedOption ? selectedOption.label : placeholder}
                    </span>
                  </Headless.Menu.Button>

                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                  </span>
                </span>

                <Headless.Menu.Items
                  className={clsx(
                    // position the popover absolutely so it doesn't push other content
                    `absolute  ${
                      selectMenuPosition ? selectMenuPosition : "top-full"
                    } left-0 z-50 mt-2`,
                    // Anchor positioning (kept as CSS vars, no behavior props)
                    "[--anchor-gap:--spacing(1)] [--anchor-padding:--spacing(1)]",
                    // Base styles
                    "isolate w-full min-w-[var(--button-width)] rounded-lg p-1.5",
                    // Invisible border that is only visible in `forced-colors` mode for accessibility purposes
                    "outline outline-transparent focus:outline-hidden",
                    // Handle scrolling when menu won't fit in viewport
                    "overflow-y-auto max-h-60",
                    // Popover background
                    "bg-zinc-900 border border-zinc-700",
                    // Shadows
                    "shadow-xl ring-1 ring-white/5",
                    // Transitions
                    "transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0",
                    // Custom menu className
                    menuClassName,
                  )}
                >
                  {children
                    ? children
                    : options.map((option) => (
                        <Headless.Menu.Item key={option.value}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => onChange(option.value)}
                              className={clsx(
                                // Base styles
                                "group cursor-pointer rounded-md px-3 py-2.5 focus:outline-hidden w-full",
                                // Text styles
                                "text-left text-sm font-medium truncate",
                                "flex items-center gap-2",
                                // Active (focus) state
                                active
                                  ? "bg-zinc-700 text-white"
                                  : "text-zinc-300",
                                // Hover
                                "hover:bg-zinc-700 hover:text-white transition-colors",
                                // Selected state
                                value === option.value &&
                                  "bg-emerald-500/20 text-emerald-400 font-semibold hover:bg-emerald-500/30",
                                // Disabled state
                                "data-disabled:opacity-50",
                              )}
                            >
                              {option.icon && (
                                <span className="flex-shrink-0 text-zinc-400">
                                  {option.icon}
                                </span>
                              )}
                              <span className="flex-1 truncate">
                                {option.label}
                              </span>
                              {value === option.value && (
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              )}
                            </button>
                          )}
                        </Headless.Menu.Item>
                      ))}
                </Headless.Menu.Items>
              </>
            );
          }}
        </Headless.Menu>
      </div>
    );
  },
);
