"use client";
import { Button } from "./button";

export function EmptyState({ icon = "📭", message, actionLabel, onAction }) {
  return (
    <div className="text-center py-12">
      <span className="text-5xl mb-4 block">{icon}</span>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
