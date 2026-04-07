"use client";

import { useRef, useEffect, useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  ChevronDown,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { adjustStockAction } from "@/app/actions/ingredients";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormInput } from "@/components/ui/form-components";

// Reasons grouped by direction
const ADD_REASONS = [
  { value: "purchase", label: "New Purchase", icon: "📦" },
  { value: "correction", label: "Stock Correction (+)", icon: "✏️" },
];

const REMOVE_REASONS = [
  { value: "expired", label: "Expired", icon: "⏰" },
  { value: "wastage", label: "Wastage/Spoiled", icon: "🗑️" },
  { value: "returned", label: "Returned to Supplier", icon: "↩️" },
  { value: "damaged", label: "Damaged", icon: "💔" },
  { value: "theft", label: "Theft/Loss", icon: "🔒" },
  { value: "correction_minus", label: "Stock Correction (−)", icon: "✏️" },
  { value: "other", label: "Other", icon: "📝" },
];

const ALL_REASONS = [...ADD_REASONS, ...REMOVE_REASONS];
const REMOVE_VALUES = new Set(REMOVE_REASONS.map((r) => r.value));

// Validation Schema
const AdjustStockSchema = (currentStock, isRemove) =>
  Yup.object().shape({
    quantity: Yup.number()
      .required("Required")
      .moreThan(0, "Enter a value greater than 0")
      .test(
        "not-negative-stock",
        "Cannot remove more than current stock",
        function (value) {
          if (!isRemove) return true;
          return (currentStock || 0) - (value || 0) >= 0;
        },
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
    quantity: "",
    newPrice: ingredient.costPerUnit || 0,
    reason: "",
    notes: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const isRemove = REMOVE_VALUES.has(values.reason);
    const selectedLabel = ALL_REASONS.find(
      (r) => r.value === values.reason,
    )?.label;
    const finalReason = values.notes.trim()
      ? `${selectedLabel}: ${values.notes.trim()}`
      : selectedLabel;

    // Send negative adjustment for "remove" reasons
    const adjustment = isRemove
      ? -Math.abs(parseFloat(values.quantity))
      : Math.abs(parseFloat(values.quantity));

    try {
      const result = await adjustStockAction(
        ingredient.id,
        adjustment,
        finalReason,
        isRemove ? undefined : values.newPrice,
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
        validationSchema={() => {
          // We need to read the current reason to determine validation
          return Yup.lazy((values) =>
            AdjustStockSchema(
              ingredient.stock,
              REMOVE_VALUES.has(values.reason),
            ),
          );
        }}
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
          const isRemove = REMOVE_VALUES.has(values.reason);
          const qty = parseFloat(values.quantity) || 0;
          const newStock = isRemove
            ? (ingredient.stock || 0) - qty
            : (ingredient.stock || 0) + qty;
          const selectedReason = ALL_REASONS.find(
            (r) => r.value === values.reason,
          );

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

              {/* Step 1: Select Reason FIRST */}
              <div className="space-y-2" ref={dropdownRef}>
                <label className="text-sm text-gray-400">
                  What are you doing?
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full h-12 bg-gray-800 border rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-between ${
                      values.reason
                        ? isRemove
                          ? "border-red-500/50"
                          : "border-green-500/50"
                        : "border-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedReason ? (
                        <>
                          <span>{selectedReason.icon}</span>
                          <span>{selectedReason.label}</span>
                          {isRemove ? (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                              Remove
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                              Add
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">
                          Select reason first...
                        </span>
                      )}
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
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                      {/* Add Stock Section */}
                      <div className="px-3 py-2 text-xs text-green-400 uppercase tracking-wider font-semibold bg-green-500/5 border-b border-gray-700/50 flex items-center gap-1.5">
                        <ArrowUp size={12} /> Add Stock
                      </div>
                      {ADD_REASONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            setFieldValue("reason", r.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                            values.reason === r.value
                              ? "bg-green-500/10 text-green-400"
                              : "text-white"
                          }`}
                        >
                          <span className="text-lg">{r.icon}</span>
                          <span>{r.label}</span>
                          {values.reason === r.value && (
                            <span className="ml-auto text-green-400">✓</span>
                          )}
                        </button>
                      ))}

                      {/* Remove Stock Section */}
                      <div className="px-3 py-2 text-xs text-red-400 uppercase tracking-wider font-semibold bg-red-500/5 border-b border-t border-gray-700/50 flex items-center gap-1.5">
                        <ArrowDown size={12} /> Remove Stock
                      </div>
                      {REMOVE_REASONS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            setFieldValue("reason", r.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                            values.reason === r.value
                              ? "bg-red-500/10 text-red-400"
                              : "text-white"
                          }`}
                        >
                          <span className="text-lg">{r.icon}</span>
                          <span>{r.label}</span>
                          {values.reason === r.value && (
                            <span className="ml-auto text-red-400">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {touched.reason && errors.reason && (
                  <p className="text-red-400 text-xs mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Step 2: Quantity (only show when reason is selected) */}
              {values.reason && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">
                      {isRemove ? "Quantity to Remove" : "Quantity to Add"}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className={`h-12 w-12 p-0 ${
                          isRemove
                            ? "border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
                            : "border-red-500/50 hover:bg-red-500/20 hover:text-red-400"
                        }`}
                        onClick={() =>
                          setFieldValue(
                            "quantity",
                            Math.max(0, (parseFloat(values.quantity) || 0) - 1),
                          )
                        }
                      >
                        <Minus size={20} />
                      </Button>

                      <div className="flex-1">
                        <FormInput
                          name="quantity"
                          type="number"
                          min="0"
                          placeholder="0"
                          className={`h-12 bg-gray-800 border-gray-700 text-center text-2xl font-bold focus:ring-orange-500 ${
                            isRemove ? "text-red-400" : "text-green-400"
                          }`}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setFieldValue(
                              "quantity",
                              isNaN(val) || val < 0 ? "" : val,
                            );
                          }}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-12 p-0 border-green-500/50 hover:bg-green-500/20 hover:text-green-400"
                        onClick={() =>
                          setFieldValue(
                            "quantity",
                            (parseFloat(values.quantity) || 0) + 1,
                          )
                        }
                      >
                        <Plus size={20} />
                      </Button>
                    </div>

                    {/* Direction indicator */}
                    <p
                      className={`text-xs text-center font-medium ${isRemove ? "text-red-400" : "text-green-400"}`}
                    >
                      {isRemove
                        ? `▼ ${qty} ${ingredient.unit} will be removed`
                        : `▲ ${qty} ${ingredient.unit} will be added`}
                    </p>
                  </div>

                  {/* Price Adjustment (only for Add reasons) */}
                  {!isRemove && (
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
                  )}

                  {/* Preview */}
                  <div
                    className={`p-4 rounded-lg text-center ${
                      newStock < 0
                        ? "bg-red-500/20 border border-red-500/50"
                        : isRemove
                          ? "bg-orange-500/10 border border-orange-500/30"
                          : "bg-green-500/10 border border-green-500/30"
                    }`}
                  >
                    <p className="text-gray-400 text-sm">
                      New Stock After Adjustment
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        newStock < 0
                          ? "text-red-400"
                          : isRemove
                            ? "text-orange-400"
                            : "text-green-400"
                      }`}
                    >
                      {newStock.toFixed(3)}{" "}
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
                </>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Additional Notes / Details
                </label>
                <textarea
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                  placeholder="E.g., Batch #1234, Dropped by accident..."
                  rows={2}
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
                    !values.quantity ||
                    parseFloat(values.quantity) <= 0 ||
                    newStock < 0 ||
                    !values.reason
                  }
                  className={
                    isRemove
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : isRemove
                      ? `Remove ${qty} ${ingredient.unit}`
                      : `Add ${qty} ${ingredient.unit}`}
                </Button>
              </ModalFooter>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
