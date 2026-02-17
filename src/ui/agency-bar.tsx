"use client";

import React from "react";
import clsx from "clsx";
import { ProgressBar } from "./progress-bar";
import { UserAvatar } from "./user-avatar";
import { StatusBadge } from "./status-badge";
import { CircleAlert } from "lucide-react";
interface AgencyBarProps {
  name: string;
  email: string;
  status?: "Active" | "Inactive" | "Trial";
  licenceUsed?: number;
  licenceTotal?: number;
  playersActive?: number;
  playersTotal?: number;
  nextCharge?: string;
  avatarSrc?: string;
  className?: string;
}

export function AgencyBar({
  name,
  email,
  status = "Active",
  licenceUsed = 72,
  licenceTotal = 100,
  playersActive = 16,
  playersTotal = 24,
  nextCharge = "Jun 24, 2025",
  avatarSrc,
  className,
}: AgencyBarProps) {
  return (
    <div
      className={clsx(
        "bg-purple-25 p-3 rounded-lg w-full overflow-hidden",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-shrink-0 w-full lg:w-auto ml-1">
          <UserAvatar
            name={name}
            email={email}
            avatar={avatarSrc}
            size="md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:ml-auto ml-1">
          {/* Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-medium text-gray-500 text-sm">Status</span>
            <StatusBadge status={status} />
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-300 flex-shrink-0" />

          {/* Licence */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-500 text-sm">
                Licence:
              </span>
              <span className="font-medium text-gray-800 text-sm">
                {licenceUsed}/{licenceTotal}
              </span>
            </div>
            <div className="w-full max-w-[120px] mt-1">
              <ProgressBar
                current={licenceUsed}
                total={licenceTotal}
                showNumbers={false}
                className="w-full"
                trackClassName="bg-background"
              />
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-300 flex-shrink-0" />

          {/* Players */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-medium text-gray-500 text-sm">Player:</span>
            <span
              className={clsx(
                "w-2.5 h-2.5 rounded-full flex-shrink-0",
                status === "Active"
                  ? "bg-green-500"
                  : status === "Trial"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              )}
            />
            <span className="text-sm font-medium text-gray-800">
              {playersActive}/{playersTotal}
            </span>
            <span className="font-semibold text-sm text-gray-500 whitespace-nowrap">
              {playersTotal - playersActive} inactive
            </span>
          </div>

          <div className="hidden sm:block h-6 w-px bg-gray-300 flex-shrink-0" />

          {/* Next Charge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-medium text-gray-500 text-sm whitespace-nowrap">
              Next Charge:
            </span>
            <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
              {nextCharge}
            </span>

            {/* Action Button */}
            <button
              aria-label="Agency info"
              className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0"
            >
              <CircleAlert className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgencyBar;
