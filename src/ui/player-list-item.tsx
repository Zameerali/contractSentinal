"use client";

import React from "react";
import {
  Folder,
  Tv,
  MonitorPlay,
  Database,
  ListVideo,
  FileText,
  LayoutGrid,
  Monitor,
  MoreVertical,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";
import { Dropdown, DropdownButton, DropdownMenu } from "./dropdown";

export type ContentType =
  | "folder"
  | "campaign"
  | "content"
  | "composition"
  | "player"
  | "playlist"
  | "datafeed"
  | "app";

const ICON_MAP: Record<ContentType, React.ElementType> = {
  folder: Folder,
  campaign: MonitorPlay,
  content: FileText,
  composition: Tv,
  player: Monitor,
  playlist: ListVideo,
  datafeed: Database,
  app: LayoutGrid,
};

interface ContentListItemProps {
  id: string;
  name: string;
  subtitle?: string;
  type?: ContentType;
  className?: string;
  onClick?: () => void;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showActions?: boolean;
  onAction?: () => void;
  menuItems?: React.ReactNode;
}

export function ContentListItem({
  id,
  name,
  subtitle,
  type = "content",
  className = "",
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckedChange,
  showActions = false,
  onAction,
  menuItems,
}: ContentListItemProps) {
  const IconComponent = ICON_MAP[type] || FileText;

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {showCheckbox && (
        <Checkbox
          checked={checked}
          onChange={(v) => onCheckedChange?.(v as boolean)}
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <span className="flex items-center flex-shrink-0">
        <IconComponent className="h-4 w-4" />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-subhead text-gray-600 truncate">{name}</p>
          {subtitle && (
            <p className="text-subhead font-semibold text-gray-600 flex-shrink-0">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {menuItems ? (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown>
            <DropdownButton
              as="button"
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0 cursor-pointer outline-none"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </DropdownButton>
            <DropdownMenu anchor="bottom end">{menuItems}</DropdownMenu>
          </Dropdown>
        </div>
      ) : showActions ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      ) : null}
    </div>
  );
}

// Backward compatibility alias
export const PlayerListItem = ContentListItem;

export default ContentListItem;

