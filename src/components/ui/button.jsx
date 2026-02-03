"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  default: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-gray-600 bg-transparent hover:bg-gray-800",
  secondary: "bg-gray-700 text-white hover:bg-gray-600",
  ghost: "hover:bg-gray-800 text-gray-300",
  link: "text-orange-400 underline-offset-4 hover:underline",
};

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-8 text-lg",
  icon: "h-10 w-10",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus:outline-none  disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
