"use client";
import { MdWarning, MdClose } from "react-icons/md";

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "info"
  loading = false,
}) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: "bg-red-500/20 text-red-400",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "bg-yellow-500/20 text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "bg-blue-500/20 text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const style = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <MdClose size={20} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-full ${style.icon} flex items-center justify-center mx-auto mb-4`}
          >
            <MdWarning size={28} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-400 text-center mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 ${style.button} text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
