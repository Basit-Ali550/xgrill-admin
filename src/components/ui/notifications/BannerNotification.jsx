"use client";
import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export function BannerNotification({
  title,
  message,
  type = "warning",
  onClose,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Auto hide after 8 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    warning: "bg-orange-500/10 border-orange-500/50 text-orange-200",
    error: "bg-red-500/10 border-red-500/50 text-red-200",
    success: "bg-green-500/10 border-green-500/50 text-green-200",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md shadow-xl max-w-sm animate-fade-in ${styles[type]}`}
    >
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <p className="text-xs opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
