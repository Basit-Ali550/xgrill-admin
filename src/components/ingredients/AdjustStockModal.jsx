"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { adjustStockAction } from "@/app/actions/ingredients";
import toast from "react-hot-toast";

const REASONS = [
  { value: "purchase", label: "New Purchase" },
  { value: "expired", label: "Expired" },
  { value: "wastage", label: "Wastage/Spoiled" },
  { value: "correction", label: "Stock Correction" },
  { value: "returned", label: "Returned to Supplier" },
];

export default function AdjustStockModal({
  isOpen,
  onClose,
  ingredient,
  onSuccess,
}) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState("purchase");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ingredient) return null;

  const handleSubmit = async () => {
    if (adjustment === 0) {
      toast.error("Adjustment cannot be zero");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adjustStockAction(
        ingredient.id,
        adjustment,
        REASONS.find((r) => r.value === reason)?.label,
      );

      if (result.success) {
        toast.success(result.message);
        setAdjustment(0);
        setReason("purchase");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStock = ingredient.stock + adjustment;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${ingredient.name}`}
    >
      <div className="space-y-6">
        {/* Current Stock Display */}
        <div className="bg-gray-800/50 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Current Stock</p>
          <p className="text-3xl font-bold text-white">
            {ingredient.stock}{" "}
            <span className="text-lg text-gray-500">{ingredient.unit}</span>
          </p>
        </div>

        {/* Adjustment Controls */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Adjustment</label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 p-0 border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
              onClick={() => setAdjustment((prev) => prev - 1)}
            >
              <Minus size={20} />
            </Button>

            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
              className="flex-1 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 p-0 border-green-500/50 hover:bg-green-500/20 hover:text-green-400"
              onClick={() => setAdjustment((prev) => prev + 1)}
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div
          className={`p-4 rounded-lg text-center ${newStock < 0 ? "bg-red-500/20 border border-red-500/50" : "bg-gray-800/30"}`}
        >
          <p className="text-gray-400 text-sm">New Stock After Adjustment</p>
          <p
            className={`text-2xl font-bold ${newStock < 0 ? "text-red-400" : adjustment > 0 ? "text-green-400" : adjustment < 0 ? "text-orange-400" : "text-white"}`}
          >
            {newStock}{" "}
            <span className="text-lg text-gray-500">{ingredient.unit}</span>
          </p>
          {newStock < 0 && (
            <p className="text-red-400 text-xs mt-1">
              Stock cannot be negative
            </p>
          )}
        </div>

        {/* Reason Selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Reason for Adjustment</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || adjustment === 0 || newStock < 0}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isSubmitting ? "Saving..." : "Apply Adjustment"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
