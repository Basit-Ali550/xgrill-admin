"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full w-8 h-8 p-0"
          >
            ✕
          </Button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// Sub-components for better organization if needed provided as simple exports
const ModalFooter = ({ children, className }) => (
  <div
    className={cn(
      "p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50",
      className,
    )}
  >
    {children}
  </div>
);

export { Modal, ModalFooter };
