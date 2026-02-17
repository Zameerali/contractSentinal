"use client";

import React, { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface SelectInputProps {
  id?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  width?: string;
  className?: string;
}

export function SelectInput({
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  searchable = false,
  leftIcon,
  rightIcon,
  width = "w-full",
  className,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        "relative rounded-lg border-[1px] border-gray-200 shadow-sm bg-white cursor-pointer",
        width,
        className,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Selected / placeholder */}
      <div
        className="flex items-center justify-between px-3 py-2"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          {leftIcon && <div>{leftIcon}</div>}
          <span className={clsx(`text-gray-400`)}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {rightIcon}
          <ChevronDown
            className={clsx("w-4 h-4 text-gray-400", isOpen && "rotate-180")}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <input
              id={id}
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none text-gray-400 placeholder-gray-400"
            />
          )}

          <ul className="py-1">
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-gray-400">No options</li>
            )}
            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange?.(String(opt.value));
                  setIsOpen(false);
                  setSearchValue("");
                }}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer text-gray-400",
                  selectedOption?.value === opt.value &&
                    "bg-purple-100 font-semibold text-white hover:bg-purple-100"
                )}
              >
                {opt.icon && <span>{opt.icon}</span>}
                <span>{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SelectInput;
