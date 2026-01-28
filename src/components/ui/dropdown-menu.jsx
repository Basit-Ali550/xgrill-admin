"use client";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pass isOpen state to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isOpen, setIsOpen });
    }
    return child;
  });

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {childrenWithProps}
    </div>
  );
};

const DropdownMenuTrigger = ({
  children,
  isOpen,
  setIsOpen,
  className,
  asChild,
}) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn("focus:outline-none", className)}
      type="button"
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({
  children,
  isOpen,
  className,
  align = "end",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-gray-800 bg-gray-900 p-1 text-white shadow-md animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, className, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-800 hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({ children, className }) => {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold opacity-70", className)}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className }) => {
  return <div className={cn("-mx-1 my-1 h-px bg-gray-800", className)} />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
