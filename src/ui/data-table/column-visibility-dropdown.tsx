"use client";

import React from "react";
import { Column } from "./DataTable";
import { Checkbox } from "../checkbox";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
} from "../dropdown";
import { Columns2, GripVertical, LucideIcon } from "lucide-react";

interface ColumnVisibilityDropdownProps {
  columns: Column<any>[];
  visibleColumns: string[];
  onColumnVisibilityChange: (columnKey: string, visible: boolean) => void;
  className?: string;
  icon?: LucideIcon;
  columnOrder?: string[];
  onColumnDragStart?: (index: number) => (e: React.DragEvent) => void;
  onColumnDragOver?: (index: number) => (e: React.DragEvent) => void;
  onColumnDrop?: () => void;
}

export function ColumnVisibilityDropdown({
  columns,
  visibleColumns,
  onColumnVisibilityChange,
  className,
  icon: Icon = Columns2,
  columnOrder,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
}: ColumnVisibilityDropdownProps) {
  const ordered = (columnOrder || columns.map((c) => c.key))
    .map((k) => columns.find((c) => c.key === k))
    .filter(Boolean) as Column<any>[];

  return (
    <Dropdown>
      <DropdownButton as="button" className="p-1 hover:bg-gray-100 rounded">
        <Columns2 className="w-5 h-5 text-primary" />
      </DropdownButton>
      <DropdownMenu anchor="bottom start" className="-mt-3 ml-2">
        {ordered.map((column, idx) => (
          <DropdownItem
            key={column.key}
            className="!text-body !text-gray-500 font-medium flex items-center gap-2"
            draggable
            onDragStart={onColumnDragStart ? onColumnDragStart(idx) : undefined}
            onDragOver={onColumnDragOver ? onColumnDragOver(idx) : undefined}
            onDrop={onColumnDrop}
          >
            <GripVertical className="w-4 h-4 mr-1 text-gray-500 cursor-grab" />
            <Checkbox
              checked={visibleColumns.includes(column.key)}
              onChange={(checked) =>
                onColumnVisibilityChange(column.key, checked)
              }
              className="mr-1"
            />
            {column.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default ColumnVisibilityDropdown;
