"use client";

import React, { forwardRef, useState, useMemo, useCallback } from "react";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactCountryFlag from "react-country-flag";
import { getData } from "country-list";
import { getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import clsx from "clsx";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
} from "./dropdown";

interface CountryFlagProps {
  countryCode: string;
  svg: boolean;
  style: React.CSSProperties;
  "data-slot"?: string;
}

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
  placeholder?: string;
  intent?: "default" | "error";
  className?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value = "",
      onChange,
      defaultCountry = "us",
      disabled = false,
      placeholder = "Enter phone number",
      intent = "default",
      className,
    },
    ref
  ) {
    const [countryCode, setCountryCode] = useState(defaultCountry.toLowerCase());

    // Get all countries
    const countries = useMemo(() => {
      return getData().map((c) => ({
        code: c.code,
        name: c.name.replace(/\s*\(the\)\s*$/i, "").trim(),
      }));
    }, []);

    // Get calling code for country
    const getCallingCodeForCountry = useCallback((code: string) => {
      try {
        return `+${getCountryCallingCode(code.toUpperCase() as CountryCode)}`;
      } catch {
        return "+1";
      }
    }, []);

    // Handle country change from dropdown
    const handleCountryChange = useCallback((code: string) => {
      setCountryCode(code.toLowerCase());
      onChange?.("");
    }, [onChange]);

    return (
      <div
        className={clsx(
          "relative flex items-center rounded-lg overflow-hidden",
          intent === "error"
            ? "border-2 border-danger-500"
            : "border-2 border-gray-200",
          "focus-within:border-primary",
          "transition-colors duration-200",
          "bg-white",
          className
        )}
        style={{ height: "38px" }}
      >
        {/* Country Selector - Just flag + chevron */}
        <Dropdown>
          <DropdownButton
            as="button"
            className="flex items-center gap-2 px-3 h-full text-foreground bg-transparent hover:bg-gray-50 shrink-0"
            aria-label="Select country"
            disabled={disabled}
          >
            {(ReactCountryFlag as (props: CountryFlagProps) => React.ReactNode)({
              countryCode: countryCode.toUpperCase(),
              svg: true,
              style: { width: "24px", height: "18px" },
              "data-slot": "icon",
            })}
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </DropdownButton>
          <DropdownMenu anchor="bottom start" className="max-h-60 overflow-y-auto">
            {countries.map((c) => (
              <DropdownItem
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
              >
                {(ReactCountryFlag as (props: CountryFlagProps) => React.ReactNode)({
                  countryCode: c.code,
                  svg: true,
                  style: { width: "20px", height: "15px" },
                  "data-slot": "icon",
                })}
                {c.name} ({getCallingCodeForCountry(c.code)})
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {/* react-phone-input-2 showing full formatted number with country code */}
        <div className="flex-1 h-full flex items-center">
          <style jsx global>{`
            .phone-input-styled .react-tel-input {
              height: 100%;
              display: flex;
              align-items: center;
            }
            .phone-input-styled .react-tel-input .flag-dropdown {
              display: none !important;
            }
            .phone-input-styled .react-tel-input .form-control {
              border: none !important;
              padding-left: 8px !important;
              height: 34px !important;
              background: transparent !important;
              font-size: 14px !important;
              width: 100% !important;
            }
            .phone-input-styled .react-tel-input .form-control:focus {
              box-shadow: none !important;
            }
          `}</style>
          <div className="phone-input-styled h-full w-full">
            <ReactPhoneInput
              country={countryCode}
              value={value}
              onChange={(val) => onChange?.(val || "")}
              disabled={disabled}
              placeholder={placeholder}
              disableDropdown
            />
          </div>
        </div>
      </div>
    );
  }
);
