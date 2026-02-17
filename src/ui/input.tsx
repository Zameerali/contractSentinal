import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React, { forwardRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimePicker } from "./TimePicker";

export function InputGroup({
  children,
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="control"
      className={clsx(
        "relative isolate block",
        "has-[[data-slot=icon]:first-child]:[&_input]:pl-10 has-[[data-slot=icon]:last-child]:[&_input]:pr-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-8 sm:has-[[data-slot=icon]:last-child]:[&_input]:pr-8",
        "*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4",
        "[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5",
        "*:data-[slot=icon]:text-zinc-500 dark:*:data-[slot=icon]:text-zinc-400"
      )}
    >
      {children}
    </span>
  );
}

const dateTypes = ["date", "datetime-local", "month", "time", "week"];
type DateType = (typeof dateTypes)[number];

export const Input = forwardRef(function Input(
  {
    className,
    intent = "default",
    unstyled = false,
    ...props
  }: {
    className?: string;
    intent?: "default" | "error";
    type?:
      | "email"
      | "number"
      | "password"
      | "search"
      | "tel"
      | "text"
      | "url"
      | DateType;
    unstyled?: boolean;
  } & Omit<Headless.InputProps, "as" | "className">,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  // Render custom TimePicker for time type
  if (props.type === "time") {
    return (
      <TimePicker
        value={(props.value as string) || ""}
        onChange={(value) => {
          if (props.onChange) {
            const syntheticEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>;
            (props.onChange as (e: React.ChangeEvent<HTMLInputElement>) => void)(syntheticEvent);
          }
        }}
        disabled={props.disabled as boolean}
        className={className}
      />
    );
  }

  if (unstyled) {
    // render a plain input without the outer decorated wrapper so it can live inside
    // another bordered container without producing nested borders
    return (
      <Headless.Input
        ref={ref}
        {...props}
        className={clsx([
          className,
          // reuse core input sizing and typography but no borders/decoration
          "relative block w-full appearance-none rounded-none px-3 py-2.5",
          "h-11",
          "text-base/6 text-foreground placeholder:text-gray-500 sm:text-sm/6",
          "bg-transparent",
          "focus:outline-hidden",
        ])}
      />
    );
  }

  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        "relative block w-full shadow-sm rounded-lg",
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        "before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-none",
        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        "dark:before:hidden",
        // Focus ring
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-2 after:ring-transparent focus-within:after:ring-primary",
        // Disabled state
        "has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none",
      ])}
    >
      <Headless.Input
        ref={ref}
        {...props}
        className={clsx([
          // Date classes
          props.type &&
            dateTypes.includes(props.type) && [
              "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
              "[&::-webkit-date-and-time-value]:min-h-[1.5em]",
              "[&::-webkit-datetime-edit]:inline-flex",
              "[&::-webkit-datetime-edit]:p-0",
              "[&::-webkit-datetime-edit-year-field]:p-0",
              "[&::-webkit-datetime-edit-month-field]:p-0",
              "[&::-webkit-datetime-edit-day-field]:p-0",
              "[&::-webkit-datetime-edit-hour-field]:p-0",
              "[&::-webkit-datetime-edit-minute-field]:p-0",
              "[&::-webkit-datetime-edit-second-field]:p-0",
              "[&::-webkit-datetime-edit-millisecond-field]:p-0",
              "[&::-webkit-datetime-edit-meridiem-field]:p-0",
            ],
          // Style date/time picker indicator (native)
          props.type === "date" &&
            "[&::-webkit-calendar-picker-indicator]:hidden",
          props.type === "time" &&
            "[&::-webkit-calendar-picker-indicator]:filter-[invert(29%)_sepia(88%)_saturate(2149%)_hue-rotate(246deg)_brightness(103%)_contrast(95%)] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:scale-130",
          // Basic layout
          "relative block w-full appearance-none rounded-lg px-3.5 py-2.5 sm:px-3 sm:py-2",
          "h-11",
          // Typography
          "text-base/6 text-foreground placeholder:text-muted-foreground sm:text-sm/6",
          props.type === "time" && "text-gray-600",
          props.type === "date" && "text-gray-600",
          "border",
          intent === "default" && "border-slate-700 text-foreground focus:border-transparent",
          intent === "error" && "border-error text-red-800",
          "bg-transparent dark:bg-white/5",
          // Hide default focus styles
          "focus:outline-none",
          // Invalid state
          // "data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-600 dark:data-invalid:data-hover:border-red-600",
          // Disabled state
          "data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15",
          // System icons
          "dark:scheme-dark",
        ])}
      />
      {props.type === "date" && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 text-primary">
          <CalendarIcon className="w-5 h-5 sm:w-4 sm:h-4" />
        </div>
      )}
    </span>
  );
});
