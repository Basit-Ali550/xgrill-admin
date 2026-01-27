"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

const Select = React.forwardRef(
  (
    {
      className,
      options = [],
      value,
      onChange,
      placeholder,
      name,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);

    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
      // Simulate native event for Formik compatibility
      const event = {
        target: {
          name,
          value: optionValue,
        },
      };
      onChange && onChange(event);
      setIsOpen(false);
    };

    const selectedOption = options.find((opt) => {
      const val = typeof opt === "object" ? opt.value : opt;
      return String(val) === String(value);
    });

    const displayValue = selectedOption
      ? typeof selectedOption === "object"
        ? selectedOption.label
        : selectedOption
      : placeholder || "Select option";

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          ref={ref}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-1 ring-orange-500 border-orange-500",
            className?.replace("w-full", ""), // Prevent double width classes if passed
          )}
          disabled={disabled}
          {...props}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-700 bg-gray-800 text-white shadow-lg animate-in fade-in-0 zoom-in-95 top-full left-0">
            <div className="p-1">
              {options.length === 0 ? (
                <div className="py-2 px-2 text-sm text-gray-400 text-center">
                  No options
                </div>
              ) : (
                options.map((opt, idx) => {
                  const optValue = typeof opt === "object" ? opt.value : opt;
                  const optLabel = typeof opt === "object" ? opt.label : opt;
                  const isSelected = String(value) === String(optValue);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(optValue)}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-700 hover:text-white",
                        isSelected && "bg-gray-700/50 text-orange-400",
                      )}
                    >
                      <span className="truncate">{optLabel}</span>
                      {isSelected && (
                        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
