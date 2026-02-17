"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import Slider from "./slider";

interface SoundSliderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function SoundSlider({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  className = "",
}: SoundSliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-subhead text-gray-700 font-medium">{label}</label>
      )}
      <div className="flex items-center gap-3 border border-gray-300 rounded-lg shadow-sm h-input px-input-px py-input-py">
        <Volume2 className="w-6 h-6 text-gray-900 flex-shrink-0" />
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className="w-full"
        />
        <span className="text-subhead text-gray-600 w-8">
          {value}
        </span>
      </div>
    </div>
  );
}
