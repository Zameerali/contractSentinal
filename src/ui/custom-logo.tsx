"use client";

import React, { useEffect, useRef } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";

interface CustomLogoProps {
  name: string;
  initialSrc?: string | null;
}

export default function CustomLogo({
  name,
  initialSrc = null,
}: CustomLogoProps) {
  const { control, setValue, getValues, watch } = useFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Watch logo from form state
  const logo = watch(name) || { url: initialSrc || "", remove: null };
  // Initialize form value
  // useEffect(() => {
  //   setValue(name, { url: initialSrc || "", remove: null });
  // }, [initialSrc, name, setValue]);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setValue(name, { url: event.target?.result as string, remove: false });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setValue(name, { url: null, remove: true });
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      {/* Logo Preview */}
      <div className="flex-shrink-0">
        {logo.url ? (
          <div
            className="w-36 h-24 rounded-lg border border-gray-300 overflow-hidden bg-white flex items-center justify-center shadow-sm"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={logo.url}
              alt="Custom Logo"
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div
            className="w-36 h-24 rounded-lg border-2 border-gray-300 bg-gray-50 flex items-center justify-center"
            style={{ aspectRatio: "16/9" }}
          >
            <span className="text-xs text-gray-400 text-center px-2 font-medium">
              SIGNAGEX Logo
            </span>
          </div>
        )}
      </div>

      {/* Logo Info */}
      <div className="flex-1">
        <div className="flex items-start pr-6">
          <div>
            <h5 className="text-title font-medium text-gray-900">Logo</h5>
            <p className="text-body text-gray-500 leading-relaxed mt-1 sm:pr-64">
              You can replace the SignageX logo with one of your own! This logo
              is displayed only when the player is turning on or does not have
              any campaigns to play. Your custom logo should be a PNG file 682px
              wide by 190px tall.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center sm:justify-start items-center gap-2 sm:ml-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/png"
          onChange={(e) => {
            if (e.target.files && e.target.files[0])
              handleLogoUpload(e.target.files[0]);
          }}
          className="hidden"
        />

        <button
          type="button"
          onClick={openFilePicker}
          aria-label="Edit logo"
          className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-white text-primary hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <SquarePen className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleRemoveLogo}
          aria-label="Remove logo"
          className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-white text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
