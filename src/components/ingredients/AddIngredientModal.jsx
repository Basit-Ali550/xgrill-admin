"use client";

import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { DollarSign, AlertTriangle, Scale, Beaker } from "lucide-react";
import {
  createIngredientAction,
  updateIngredientAction,
} from "@/app/actions/ingredients";
import toast from "react-hot-toast";
import { FormInput } from "@/components/ui/form-components";

const IngredientSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  unit: Yup.string().required("Unit is required"),
  stock: Yup.number().min(0, "Cannot be negative").required("Required"),
  costPerUnit: Yup.number().min(0, "Cannot be negative").required("Required"),
  lowStockThreshold: Yup.number()
    .min(0, "Cannot be negative")
    .required("Required"),
});

const UNIT_OPTIONS = [
  { value: "g", label: "Grams", icon: "⚖️" },
  { value: "kg", label: "Kilograms", icon: "📦" },
  { value: "ml", label: "Milliliters", icon: "💧" },
  { value: "l", label: "Liters", icon: "🧪" },
  { value: "pcs", label: "Pieces", icon: "🔢" },
];

export default function AddIngredientModal({
  isOpen,
  onClose,
  ingredientToEdit,
}) {
  const isEditing = !!ingredientToEdit;

  const initialValues = {
    name: ingredientToEdit?.name || "",
    unit: ingredientToEdit?.unit || "g",
    stock: ingredientToEdit?.stock || 0,
    costPerUnit: ingredientToEdit?.costPerUnit || 0,
    lowStockThreshold: ingredientToEdit?.lowStockThreshold || 10,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let result;
      if (isEditing) {
        result = await updateIngredientAction(ingredientToEdit.id, values);
      } else {
        result = await createIngredientAction(values);
      }

      if (result.success) {
        toast.success(isEditing ? "Ingredient updated!" : "Ingredient added!");
        resetForm();
        onClose();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save ingredient");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Ingredient" : "Add New Ingredient"}
      className="max-w-lg"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={IngredientSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, handleChange, values }) => (
          <Form className="space-y-6">
            <div className="relative">
              <FormInput
                label="Ingredient Name"
                name="name"
                placeholder="e.g. Chicken Breast"
                className="bg-gray-800 border-gray-700 h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Scale size={14} /> Unit of Measurement
              </label>
              <div className="grid grid-cols-5 gap-2">
                {UNIT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "unit", value: option.value },
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                      values.unit === option.value
                        ? "bg-orange-500/20 border-orange-500 text-orange-400"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-xs font-medium">{option.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stock & Cost Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Current Stock */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Beaker size={12} />{" "}
                  {isEditing ? "Current Stock" : "Initial Stock"}
                </label>
                <div className="flex items-center gap-2">
                  <FormInput
                    name="stock"
                    type="number"
                    min="0"
                    className="h-10 text-xl font-bold bg-transparent border-0 p-0 focus:ring-0"
                  />
                  <span className="text-gray-500 text-sm">{values.unit}</span>
                </div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <DollarSign size={12} /> Purchase Price (per {values.unit})
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Rs.</span>
                  <FormInput
                    name="costPerUnit"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-10 bg-gray-900/50 border-gray-700 text-green-400 font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle size={18} className="text-orange-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-orange-300 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    You&apos;ll receive an alert when stock falls below this
                    level
                  </p>
                  <div className="flex items-center gap-2">
                    <FormInput
                      name="lowStockThreshold"
                      type="number"
                      min="0"
                      className="w-24 h-8 bg-gray-900/50 border-orange-500/30 text-center"
                    />
                    <span className="text-gray-500 text-sm">{values.unit}</span>
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter className="pt-4 border-t border-gray-800">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 shadow-lg shadow-orange-500/20"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Ingredient"
                    : "Add Ingredient"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
