"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
} from "../dropdown";

interface RowActionsDropdownProps<T = any> {
  row: T;
  onView?: (row: T) => void;
  onViewLabel?: string;
  onExport?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function RowActionsDropdown<T = any>({
  row,
  onView,
  onViewLabel,
  onExport,
  onEdit,
  onDelete,
}: RowActionsDropdownProps<T>) {
  return (
    <Dropdown>
      <DropdownButton
        as="div"
        aria-label="More options"
        className="p-1 rounded-md hover:bg-gray-100 cursor-pointer inline-flex"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4 text-gray-900" />
      </DropdownButton>

      <DropdownMenu
        anchor="bottom end"
        className="min-w-[200px] border border-gray-200 shadow-lg"
      >
        {onView && (
          <DropdownItem
            className="-mx-1 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
          >
            <span data-slot="label">{onViewLabel || "View"}</span>
          </DropdownItem>
        )}

        {onExport && (
          <DropdownItem
            className="-mx-1 text-gray-700"
            onClick={() => onExport(row)}
          >
            <span data-slot="label">Export</span>
          </DropdownItem>
        )}

        {onEdit && (
          <DropdownItem
            className="-mx-1 text-gray-700"
            onClick={() => onEdit(row)}
          >
            <span data-slot="label">Edit</span>
          </DropdownItem>
        )}

        {onDelete && (
          // make the top border touch the dropdown edges by extending the item horizontally
          <DropdownItem
            className="-mx-1 mt-0 border-t border-gray-200"
            onClick={(e) => {
              // e.preventDefault();
              e.stopPropagation();
              onDelete(row);
            }}
          >
            <div>
              <span data-slot="label" className="text-red-500">
                Delete
              </span>
            </div>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

export default RowActionsDropdown;
