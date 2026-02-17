"use client";

import React from "react";
import { clsx } from "clsx";

interface PlayerNameProps {
  name: string;
  status?: string;
  avatarSrc?: string;
}

export function PlayerName({
  name,
  status = "Offline",
  avatarSrc,
}: PlayerNameProps) {
  const isOnline = status === "Online";

  return (
    <div className="flex flex-col">
      <div className="text-subhead text-gray-900 font-regular">{name}</div>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={clsx(
            "inline-block w-2 h-2 rounded-full",
            isOnline ? "bg-green-400" : "bg-gray-300"
          )}
        />
        <span
          className={clsx(
            "text-body font-medium",
            isOnline ? "text-green-800" : "text-gray-400"
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default PlayerName;
