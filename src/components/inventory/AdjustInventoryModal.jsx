"use client";

import { useState, useRef, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const REASONS = [
  { value: "purchase", label: "New Purchase", icon: "📦" },
  { value: "expired", label: "Expired", icon: "⏰" },
  { value: "wastage", label: "Wastage/Spoiled", icon: "🗑️" },
  { value: "correction", label: "Stock Correction", icon: "✏️" },
  { value: "returned", label: "Returned to Supplier", icon: "↩️" },
  { value: "damaged", label: "Damaged", icon: "💔" },
  { value: "theft", label: "Theft/Loss", icon: "🔒" },
  { value: "other", label: "Other", icon: "📝" },
];

export default function AdjustInventoryModal({
  isOpen,
  onClose,
  item,
  onAdjust, // Passed from parent (hook function)
  onSuccess,
}) {
  const [adjustment, setAdjustment] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [reason, setReason] = useState("purchase");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize price when item changes
  useEffect(() => {
    if (item) {
      setNewPrice(item.product?.purchasePrice || 0);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async () => {
    const adjustmentVal = adjustment === "" ? 0 : adjustment;
    if (adjustmentVal === 0) {
      toast.error("Adjustment cannot be zero");
      return;
    }

    const selectedLabel = REASONS.find((r) => r.value === reason)?.label;
    const finalReason = notes.trim()
      ? `${selectedLabel}: ${notes.trim()}`
      : selectedLabel;

    setIsSubmitting(true);
    try {
      // Call the hook function passed from parent
      // Note: item.productId is what we use to adjust inventory
      const result = await onAdjust(
        item.productId,
        adjustmentVal,
        finalReason,
        newPrice,
      );

      if (result.success) {
        toast.success(result.message || "Stock adjusted successfully");
        setAdjustment("");
        setReason("purchase");
        setNotes("");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error || "Failed to adjust stock");
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReason = REASONS.find((r) => r.value === reason);
  const adjustmentVal = adjustment === "" ? 0 : adjustment;
  const newStock = (item.quantity || 0) + adjustmentVal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${item.product?.name || "Item"}`}
    >
      <div className="space-y-6">
        {/* Current Stock Display */}
        <div className="bg-gray-800/50 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Current Stock</p>
          <p className="text-3xl font-bold text-white">
            {item.quantity}{" "}
            <span className="text-lg text-gray-500">
              {item.product?.unitType || "pcs"}
            </span>
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
              onClick={() =>
                setAdjustment((prev) => (prev === "" ? -1 : prev - 1))
              }
            >
              <Minus size={20} />
            </Button>

            <input
              type="number"
              value={adjustment}
              onChange={(e) => {
                const val = e.target.value;
                setAdjustment(val === "" ? "" : parseFloat(val));
              }}
              placeholder="0"
              className="flex-1 h-12 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 p-0 border-green-500/50 hover:bg-green-500/20 hover:text-green-400"
              onClick={() =>
                setAdjustment((prev) => (prev === "" ? 1 : prev + 1))
              }
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Price Adjustment */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            New Purchase Price (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              Rs
            </span>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
              min="0"
            />
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
            <span className="text-lg text-gray-500">
              {item.product?.unitType || "pcs"}
            </span>
          </p>
          {newStock < 0 && (
            <p className="text-red-400 text-xs mt-1">
              Stock cannot be negative
            </p>
          )}
        </div>

        {/* Reason Selection */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="text-sm text-gray-400">Reason Category</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-12 bg-gray-800 border border-gray-700 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>{selectedReason?.icon}</span>
                <span>{selectedReason?.label}</span>
              </span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setReason(r.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${reason === r.value ? "bg-orange-500/20 text-orange-400" : "text-white"}`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span>{r.label}</span>
                    {reason === r.value && (
                      <span className="ml-auto text-orange-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Additional Notes / Reason Details
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Batch #1234, Dropped by accident..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
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
