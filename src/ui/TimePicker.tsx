"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import clsx from "clsx";

interface TimePickerProps {
  value: string; // Format: "HH:mm" or "HH:mm:ss"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Select time",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && typeof value === "string") {
      const [hours, minutes] = value.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        setSelectedHour(hour12);
        setSelectedMinute(minutes);
        setSelectedPeriod(period);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = () => {
    if (!value) return "";
    const hour12 = selectedHour;
    const minuteStr = selectedMinute.toString().padStart(2, "0");
    return `${hour12.toString().padStart(2, "0")}:${minuteStr} ${selectedPeriod}`;
  };

  const handleTimeChange = (hour: number, minute: number, period: "AM" | "PM") => {
    // Convert to 24-hour format for the value
    let hour24 = hour;
    if (period === "PM" && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === "AM" && hour === 12) {
      hour24 = 0;
    }
    const timeStr = `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    onChange(timeStr);
  };

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    handleTimeChange(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    handleTimeChange(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodSelect = (period: "AM" | "PM") => {
    setSelectedPeriod(period);
    handleTimeChange(selectedHour, selectedMinute, period);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);


  return (
    <div ref={containerRef} className={clsx("relative w-full", className)}>
      {/* Input Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer shadow-sm",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          isOpen && "border-primary"
        )}
      >
        <span className={clsx("text-subhead", value ? "text-gray-700" : "text-gray-500")}>
          {value ? formatTime() : placeholder}
        </span>
        <Clock className="w-4 h-4 text-primary" />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex gap-2">
            {/* Hours Column */}
            <div className="flex-1">
              <div className="text-body text-gray-700 text-center mb-1 font-medium">Hour</div>
              <div className="h-40 overflow-y-auto scrollbar-hide">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    className={clsx(
                      "py-1.5 px-2 text-center text-body cursor-pointer rounded transition-colors",
                      selectedHour === hour
                        ? "bg-primary text-white font-medium"
                        : "hover:bg-purple-25 text-gray-700"
                    )}
                  >
                    {hour.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1">
              <div className="text-body text-gray-700 text-center mb-1 font-medium">Min</div>
              <div className="h-40 overflow-y-auto scrollbar-hide">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    className={clsx(
                      "py-1.5 px-2 text-center text-body cursor-pointer rounded transition-colors",
                      selectedMinute === minute
                        ? "bg-primary text-white font-medium"
                        : "hover:bg-purple-25 text-gray-700"
                    )}
                  >
                    {minute.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="flex-1">
              <div className="text-body text-gray-500 text-center mb-1 font-medium">&nbsp;</div>
              <div className="space-y-1">
                {(["AM", "PM"] as const).map((period) => (
                  <div
                    key={period}
                    onClick={() => handlePeriodSelect(period)}
                    className={clsx(
                      "py-1.5 px-2 text-center text-body cursor-pointer rounded font-medium transition-colors",
                      selectedPeriod === period
                        ? "bg-primary text-white"
                        : "hover:bg-purple-25 text-gray-700"
                    )}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;
