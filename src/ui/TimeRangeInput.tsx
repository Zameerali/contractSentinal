"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface TimeRangeInputProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export default function TimeRangeInput({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={startTime}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onStartTimeChange(e.target.value)
        }
        className="w-30 min-w-0"
      />
      <span className="text-gray-500">-</span>
      <Input
        type="time"
        value={endTime}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onEndTimeChange(e.target.value)
        }
        className="w-30 min-w-0"
      />
    </div>
  );
}
