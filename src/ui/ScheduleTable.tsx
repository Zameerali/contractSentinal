"use client";

import React from "react";
import {
  Clock,
  MoreVertical,
  Plus,
  Trash2,
  SquarePen,
  GitCommitHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import DaySelector from "@/components/ui/DaySelector";
import TimeRangeInput from "@/components/ui/TimeRangeInput";

export interface ScheduleEntry {
  id: string;
  days: {
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
  startTime: string;
  endTime: string;
}

interface ScheduleTableProps {
  onScheduleChange?: (schedules: ScheduleEntry[]) => void;
  initialSchedules?: ScheduleEntry[];
  onExpandedChange?: (isExpanded: boolean) => void;
}

export default function ScheduleTable({
  onScheduleChange,
  initialSchedules = [
    {
      id: "1",
      days: {
        sun: true,
        mon: true,
        tue: true,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
      },
      startTime: "01:00",
      endTime: "14:00",
    },
  ],
  onExpandedChange,
}: ScheduleTableProps) {
  const [schedules, setSchedules] =
    React.useState<ScheduleEntry[]>(initialSchedules);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  // local state for the expanded-view dropdown(s) — not tied to schedule data
  const [expandedActions, setExpandedActions] = React.useState<
    Record<string, string>
  >({});
  const [expandedAll, setExpandedAll] = React.useState<boolean>(false);

  React.useEffect(() => {
    onExpandedChange?.(expandedAll || expandedId !== null);
  }, [expandedAll, expandedId, onExpandedChange]);

  const handleAddSchedule = () => {
    const newSchedule: ScheduleEntry = {
      id: Date.now().toString(),
      days: {
        sun: false,
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
      },
      startTime: "00:00",
      endTime: "23:59",
    };
    const updated = [...schedules, newSchedule];
    setSchedules(updated);
    onScheduleChange?.(updated);
  };

  const handleRemoveSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    onScheduleChange?.(updated);
  };

  const handleUpdateSchedule = (
    id: string,
    field: keyof ScheduleEntry,
    value: any
  ) => {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setSchedules(updated);
    onScheduleChange?.(updated);
  };

  const handleDayToggle = (
    scheduleId: string,
    dayKey: string,
    value: boolean
  ) => {
    const updated = schedules.map((s) =>
      s.id === scheduleId
        ? {
            ...s,
            days: {
              ...s.days,
              [dayKey]: value,
            },
          }
        : s
    );
    setSchedules(updated);
    onScheduleChange?.(updated);
  };

  const toggleExpanded = (id: string) => {
    if (!expandedAll) {
      setExpandedAll(true);
      setExpandedId(id);
      return;
    }
    setExpandedAll(false);
    setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      {!expandedAll && expandedId === null ? (
        <div className="overflow-x-auto">
          <div className="min-w-[768px]">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="relative grid grid-cols-12 items-center gap-3 bg-white px-0 py-2 text-sm font-medium text-gray-600">
                <div
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: "calc(100% * 7 / 12)" }}
                  aria-hidden
                />
                <div
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: "calc(100% * 11 / 12)" }}
                  aria-hidden
                />

                <div className="col-span-7 pl-4 pr-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50">
                    <GitCommitHorizontal className="w-3.5 h-3.5 text-gray-900" />
                  </span>
                  <span className="text-gray-900">Select Days of Week</span>
                </div>

                <div className="col-span-4 flex items-center gap-2 pl-3 pr-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50">
                    <Clock className="w-3.5 h-3.5 text-gray-900" />
                  </span>
                  <span className="text-gray-900">Time</span>
                </div>

                <div className="col-span-1 text-right pr-4 text-gray-900">
                  Action
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-200">
                {schedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="grid grid-cols-12 items-center gap-3 px-4 py-3 bg-gray-50"
                  >
                    {/* Days Checkboxes */}
                    <div className="col-span-7">
                      <DaySelector
                        days={schedule.days}
                        onDayChange={(dayKey, value) =>
                          handleDayToggle(schedule.id, dayKey, value)
                        }
                      />
                    </div>

                    {/* Time Range */}
                    <div className="col-span-4 px-4">
                      <TimeRangeInput
                        startTime={schedule.startTime}
                        endTime={schedule.endTime}
                        onStartTimeChange={(value) =>
                          handleUpdateSchedule(schedule.id, "startTime", value)
                        }
                        onEndTimeChange={(value) =>
                          handleUpdateSchedule(schedule.id, "endTime", value)
                        }
                      />
                    </div>

                    {/* Action Button */}
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => toggleExpanded(schedule.id)}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label={`Edit schedule ${index + 1}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white px-4 py-2 border-t border-gray-200">
                <Button
                  onClick={handleAddSchedule}
                  outline
                  size="sm"
                  className="!border-dashed !border-gray-300"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  Add another
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-full sm:w-1/4 bg-gray-50 py-2 rounded-t-lg">
            <Select
              value={
                expandedActions[expandedAll ? "global" : expandedId ?? ""] ?? ""
              }
              onChange={(v) =>
                setExpandedActions((prev) => ({
                  ...prev,
                  [expandedAll ? "global" : expandedId ?? ""]: v,
                }))
              }
              options={[{ value: "keep", label: "keep playing Campaigns" }]}
              placeholder="Select action"
            />
          </div>

          {schedules.map((schedule, index) => {
            if (!expandedAll && expandedId !== schedule.id) return null;

            return (
              <div key={schedule.id} className="space-y-4 mt-4">
                <div className="relative rounded-lg border-2 border-dashed border-gray-300 py-2">
                  <h4 className="absolute bg-gray-50 -top-3 left-4 text-sm font-semibold text-primary px-2">
                    Schedule {index + 1}
                  </h4>

                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-px h-8 bg-gray-200"
                    style={{ left: "calc(100% * 7 / 12)" }}
                    aria-hidden
                  />

                  {/* Content row */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[768px]">
                      <div className="grid grid-cols-12 items-center gap-3 px-4 py-2 rounded-b-lg">
                        {/* Days Checkboxes */}
                        <div className="col-span-7">
                          <DaySelector
                            days={schedule.days}
                            onDayChange={(dayKey, value) =>
                              handleDayToggle(schedule.id, dayKey, value)
                            }
                          />
                        </div>
                        {/* Time Range */}
                        <div className="col-span-4">
                          <TimeRangeInput
                            startTime={schedule.startTime}
                            endTime={schedule.endTime}
                            onStartTimeChange={(value) =>
                              handleUpdateSchedule(
                                schedule.id,
                                "startTime",
                                value
                              )
                            }
                            onEndTimeChange={(value) =>
                              handleUpdateSchedule(
                                schedule.id,
                                "endTime",
                                value
                              )
                            }
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="col-span-1 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleExpanded(schedule.id)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Edit"
                          >
                            <SquarePen className="w-4 h-4 text-primary" />
                          </button>
                          <button
                            onClick={() => {
                              handleRemoveSchedule(schedule.id);
                              setExpandedId(null);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div>
            <Button
              onClick={() => {
                handleAddSchedule();
                setExpandedId(null);
                setExpandedAll(false);
              }}
              outline
              size="sm"
              className="!border-dashed !border-gray-300 mt-2"
            >
              <Plus className="w-4 h-4 text-primary stroke-2" />
              Add another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
