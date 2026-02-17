"use client";

import React, { useState, KeyboardEvent } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

interface Tag {
  id: string;
  label: string;
}

interface TagsInputProps {
  id?: string;
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  placeholder?: string;
  maxTags?: number;
  width?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function TagsInput({
  disabled,
  id,
  value = [],
  onChange,
  placeholder = "Add tags",
  maxTags = 10,
  width = "w-full",
  className,
  inputClassName,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (label: string) => {
    if (!label.trim()) return;
    if (value.length >= maxTags) return;
    const newTag = { id: Date.now().toString(), label: label.trim() };
    const updatedTags = [...value, newTag];
    onChange?.(updatedTags);
    setInputValue("");
  };

  const removeTag = (id: string) => {
    const updatedTags = value.filter((tag) => tag.id !== id);
    onChange?.(updatedTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length) {
      removeTag(value[value.length - 1].id);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm min-h-[38px]",
        width,
        className
      )}
    >
      {value.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1 px-2 py-1 bg-purple-25 text-primary rounded text-sm"
        >
          <span>{tag.label}</span>
          <button
            type="button"
            onClick={() => removeTag(tag.id)}
            className="hover:bg-gray-200 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <input
        id={id}
        type="text"
        disabled={disabled}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clsx(
          "flex-1 min-w-[120px] outline-none px-1 py-1 text-sm",
          inputClassName
        )}
      />
    </div>
  );
}

export default TagsInput;
