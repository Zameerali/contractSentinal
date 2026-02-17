"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface DaysSelectorProps {
  days: {
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
  onDayChange: (dayKey: string, value: boolean) => void;
}

const DAYS = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

export default function DaySelector({ days, onDayChange }: DaysSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-7">
      {DAYS.map((day) => (
        <label
          key={day.key}
          className="flex items-center gap-1 cursor-pointer group"
        >
          <Checkbox
            checked={days[day.key as keyof typeof days]}
            onChange={(checked) => onDayChange(day.key, checked as boolean)}
          />
          <span className="text-title font-medium text-gray-500">{day.label}</span>
        </label>
      ))}
    </div>
  );
}
