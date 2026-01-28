"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  secondary: "bg-gray-700 text-gray-300 border-gray-600",
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  destructive: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center text-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
