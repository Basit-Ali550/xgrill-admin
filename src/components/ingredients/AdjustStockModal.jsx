"use client";

import { useRef, useEffect, useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChevronDown, AlertTriangle } from "lucide-react";
import { adjustStockAction } from "@/app/actions/ingredients";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormInput } from "@/components/ui/form-components";

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

// Validation Schema
const AdjustStockSchema = (currentStock) =>
  Yup.object().shape({
    adjustment: Yup.number()
      .required("Required")
      .test("not-zero", "Adjustment cannot be zero", (value) => value !== 0)
      .test(
        "not-negative-stock",
        "Resulting stock cannot be negative",
        (value) => (currentStock || 0) + (value || 0) >= 0,
      ),
    newPrice: Yup.number()
      .min(0, "Price cannot be negative")
      .nullable()
      .transform((v, o) => (o === "" ? null : v)),
    reason: Yup.string().required("Reason is required"),
    notes: Yup.string(),
  });

export default function AdjustStockModal({
  isOpen,
  onClose,
  ingredient,
  onSuccess,
}) {
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

  if (!ingredient) return null;

  const initialValues = {
    adjustment: 0,
    newPrice: ingredient.costPerUnit || 0,
    reason: "purchase",
    notes: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const selectedLabel = REASONS.find((r) => r.value === values.reason)?.label;
    const finalReason = values.notes.trim()
      ? `${selectedLabel}: ${values.notes.trim()}`
      : selectedLabel;

    try {
      const result = await adjustStockAction(
        ingredient.id,
        values.adjustment,
        finalReason,
        values.newPrice,
      );

      if (result.success) {
        toast.success(result.message);
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error || result.message);
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${ingredient.name}`}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={AdjustStockSchema(ingredient.stock)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          isSubmitting,
        }) => {
          const newStock = (ingredient.stock || 0) + (values.adjustment || 0);
          const selectedReason = REASONS.find((r) => r.value === values.reason);

          return (
            <Form className="space-y-6">
              {/* Current Stock Display */}
              <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Current Stock</p>
                <p className="text-3xl font-bold text-white">
                  {ingredient.stock}{" "}
                  <span className="text-lg text-gray-500">
                    {ingredient.unit}
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
                      setFieldValue("adjustment", (values.adjustment || 0) - 1)
                    }
                  >
                    <Minus size={20} />
                  </Button>

                  <div className="flex-1">
                    <FormInput
                      name="adjustment"
                      type="number"
                      className="h-12 bg-gray-800 border-gray-700 text-center text-2xl text-white font-bold focus:ring-orange-500"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFieldValue("adjustment", isNaN(val) ? 0 : val);
                      }}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 p-0 border-green-500/50 hover:bg-green-500/20 hover:text-green-400"
                    onClick={() =>
                      setFieldValue("adjustment", (values.adjustment || 0) + 1)
                    }
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              </div>

              {/* Price Adjustment */}
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-4 top-[38px] z-10 text-gray-400 font-bold">
                    Rs
                  </span>
                  <FormInput
                    label={`New Purchase Price (per ${ingredient.unit})`}
                    name="newPrice"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    className="h-12 bg-gray-800 border-gray-700 pl-12 pr-4 text-white text-lg font-bold focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Preview */}
              <div
                className={`p-4 rounded-lg text-center ${
                  newStock < 0
                    ? "bg-red-500/20 border border-red-500/50"
                    : "bg-gray-800/30"
                }`}
              >
                <p className="text-gray-400 text-sm">
                  New Stock After Adjustment
                </p>
                <p
                  className={`text-2xl font-bold ${
                    newStock < 0
                      ? "text-red-400"
                      : values.adjustment > 0
                        ? "text-green-400"
                        : values.adjustment < 0
                          ? "text-orange-400"
                          : "text-white"
                  }`}
                >
                  {newStock}{" "}
                  <span className="text-lg text-gray-500">
                    {ingredient.unit}
                  </span>
                </p>
                {newStock < 0 && (
                  <p className="text-red-400 text-xs mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle size={12} /> Stock cannot be negative
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
                      className={`text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
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
                            setFieldValue("reason", r.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                            values.reason === r.value
                              ? "bg-orange-500/20 text-orange-400"
                              : "text-white"
                          }`}
                        >
                          <span className="text-lg">{r.icon}</span>
                          <span>{r.label}</span>
                          {values.reason === r.value && (
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
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  placeholder="E.g., Batch #1234, Dropped by accident..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <ModalFooter className="mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    values.adjustment === 0 ||
                    newStock < 0 ||
                    !values.reason
                  }
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? "Saving..." : "Apply Adjustment"}
                </Button>
              </ModalFooter>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
