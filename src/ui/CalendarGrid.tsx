"use client";
import React, { useState } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  startHour: number;
  endHour: number;
}

interface CalendarGridProps {
  events: CalendarEvent[];
  days?: string[];
  timezone?: string;
  formatHour?: (hour: number) => string;
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string | null) => void;
}

export default function CalendarGrid({
  events,
  days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  timezone = "GMT +05",
  formatHour,
  selectedEventId,
  onSelectEvent,
}: CalendarGridProps) {
  const ROW_HEIGHT = 48;
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const defaultFormatHour = (hour: number) => {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour} ${period}`;
  };

  const displayFormatHour = formatHour || defaultFormatHour;

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Body - Horizontally scrollable on mobile */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="relative min-w-max md:min-w-0">
          <div className="flex">
            <div className="w-12 md:w-20 flex-shrink-0 px-1 md:px-2 text-[8px] font-medium text-gray-900">
            </div>
            {days.map((day, index) => (
              <div
                key={day}
                className="flex-1 min-w-[100px] md:min-w-0 text-center text-[10px] md:text-title font-medium text-gray-900"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
        <div className="relative">
          <div className="flex h-6 flex-shrink-0">
            <div className="w-12 md:w-20 flex-shrink-0 relative border-r border-transparent">
              <div className="absolute bottom-0 right-1 md:right-2 text-[7px] md:text-[8px] text-gray-900 font-medium pr-1">
                {timezone}
              </div>
              <div className="absolute bottom-0 -right-px w-px bg-gray-200 h-2" />
            </div>
            {days.map((_, i) => (
              <div
                key={i}
                className="flex-1 min-w-[100px] md:min-w-0 relative border-r border-transparent last:border-r-0"
              >
                {i < days.length - 1 && (
                  <div className="absolute bottom-0 -right-px w-px bg-gray-200 h-2" />
                )}
              </div>
            ))}
          </div>
          <div className="flex h-12">
            <div className="w-12 md:w-20 flex-shrink-0 border-r border-gray-200 relative">
              <div className="absolute top-0 right-0 h-px bg-gray-200 w-2 md:w-3" />
              <div className="absolute top-0 right-2 md:right-3 -translate-y-3 text-[8px] text-gray-900 pr-1">
              </div>
            </div>

            {days.map((_, i) => (
              <div
                key={i}
                className="flex-1 min-w-[100px] md:min-w-0 border-r border-gray-200 last:border-r-0 border-t border-gray-200"
              />
            ))}
          </div>

          {HOURS.map((hour) => (
            <div key={hour} className="flex h-12 relative">
              <div className="w-12 md:w-20 flex-shrink-0 border-r border-gray-200 relative">
                <div className="absolute top-0 right-0 h-px bg-gray-200 w-2"></div>
                <div className="absolute top-0 right-1 md:right-3 -translate-y-2 text-[7px] md:text-[8px] text-gray-900 font-medium bg-white pr-1">
                  {displayFormatHour(hour)}
                </div>
              </div>
              {days.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="flex-1 min-w-[100px] md:min-w-0 border-r border-gray-200 last:border-r-0 border-t border-gray-200 relative"
                >
                  {events
                    .filter((e) => e.day === dayIndex && e.startHour === hour)
                    .map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onSelectEvent?.(event.id)}
                        className={`absolute left-0 right-0 mx-1 my-1 text-[10px] p-2 rounded overflow-hidden cursor-pointer transition-colors ${
                          selectedEventId === event.id
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                        style={{
                          height: `${
                            (event.endHour - event.startHour) * ROW_HEIGHT - 8
                          }px`,
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div
                          className={`text-[10px] ${
                            selectedEventId === event.id
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {displayFormatHour(event.startHour)} -{" "}
                          {displayFormatHour(event.endHour)}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
