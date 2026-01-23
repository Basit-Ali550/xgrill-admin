"use client";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-orange-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
