"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface FloatingMenuProps {
  open: boolean;
  anchorPoint?: { x: number; y: number } | null;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FloatingMenu({
  open,
  anchorPoint,
  onClose,
  children,
  className,
}: FloatingMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorPoint) return setPos(null);
    const left = (anchorPoint.x ?? 0) + (window.scrollX || 0);
    const top = (anchorPoint.y ?? 0) + (window.scrollY || 0) + 12;
    setPos({ left, top });
  }, [anchorPoint]);

  if (!open || !anchorPoint || !pos) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: pos.top,
    left: pos.left,
    zIndex: 1000,
    transform: "translateX(-50%)",
    minWidth: 420,
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      style={style}
      className={clsx(
        "bg-white border border-gray-200 rounded-xl shadow-lg p-3",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}

export default FloatingMenu;

export function MenuItem({
  icon,
  label,
  selected = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full text-left rounded-lg px-4 h-9",
        selected ? "bg-purple-25" : "bg-gray-50",
        "hover:bg-gray-100 focus:outline-none"
      )}
      style={
        selected
          ? { boxShadow: "inset 0 0 0 1px var(--color-primary)" }
          : undefined
      }
    >
      <span className="w-6 h-6 flex items-center justify-center text-gray-900 bg-purple-25 rounded-md">
        {icon}
      </span>
      <span className="text-sm text-gray-900 font-normal">{label}</span>
      {selected && <span className="sr-only">selected</span>}
    </button>
  );
}
