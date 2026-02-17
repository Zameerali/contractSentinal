"use client";

import React from "react";
import { clsx } from "clsx";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "./table";
import { Input, InputGroup } from "./input";
import { Checkbox } from "./checkbox";
import { Button } from "./button";

interface OrgRow {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Trial" | "Inactive";
  licenceUsed: number;
  licenceTotal: number;
  playersActive: number;
  playersTotal: number;
  created: string;
  nextCharge: string;
  avatar?: string;
}

export function OrganizationsList({ items }: { items: OrgRow[] }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <InputGroup>
          <svg
            data-slot="icon"
            className="w-4 h-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Input
            placeholder="Search by org name, owner email, region."
            type="search"
          />
        </InputGroup>

        <button className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600">
          + Add Filter
        </button>
      </div>

      <div className="overflow-auto bg-white border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="w-12">
                <Checkbox aria-label="select all" />
              </TableHeader>
              <TableHeader>Organizations</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Licence Usage</TableHeader>
              <TableHeader>Players Online</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Next Charge</TableHeader>
              <TableHeader className="w-16" />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow
                key={it.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <TableCell>
                  <Checkbox aria-label={`select ${it.name}`} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center">
                      {it.avatar ? (
                        <img
                          src={it.avatar}
                          alt={it.name}
                          className="w-9 h-9 rounded-md"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-500 font-semibold">
                            {it.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {it.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {it.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={clsx(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                      it.status === "Active"
                        ? "bg-success-50 text-success-500"
                        : it.status === "Trial"
                        ? "bg-warning-50 text-warning-500"
                        : "bg-gray-50 text-gray-500"
                    )}
                  >
                    {it.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-gray-900 rounded-full"
                        style={{
                          width: `${Math.round(
                            (it.licenceUsed / it.licenceTotal) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {it.licenceUsed}/{it.licenceTotal}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {it.playersActive}/{it.playersTotal}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {it.created}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {it.nextCharge}
                </TableCell>
                <TableCell className="text-right">
                  <Button plain className="p-2">
                    ⋮
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Showing{" "}
          <select className="mx-2 border border-gray-200 rounded-md px-2 py-1">
            <option>100</option>
            <option>50</option>
          </select>{" "}
          of {items.length} results
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border border-gray-200 rounded-md">
            &lt;
          </button>
          <button className="px-3 py-1 bg-white border border-gray-200 rounded-md">
            1
          </button>
          <button className="px-2 py-1 border border-gray-200 rounded-md">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrganizationsList;
