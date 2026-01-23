"use client";
import { getStatusStyle } from "@/constants";

export function StatusBadge({ status, size = "sm" }) {
  const { bg, color, label } = getStatusStyle(status);

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{ background: bg, color }}
    >
      {label || status}
    </span>
  );
}
