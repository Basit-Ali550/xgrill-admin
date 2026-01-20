"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Package,
  DollarSign,
  AlertTriangle,
  Scale,
  Beaker,
} from "lucide-react";
import {
  createIngredientAction,
  updateIngredientAction,
} from "@/app/actions/ingredients";
import toast from "react-hot-toast";

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
        {({
          errors,
          touched,
          isSubmitting,
          handleChange,
          handleBlur,
          values,
        }) => (
          <Form className="space-y-6">
            {/* Ingredient Name - Hero Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                <Package size={20} />
              </div>
              <input
                name="name"
                placeholder="Ingredient Name (e.g., Chicken Breast)"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full h-14 pl-12 pr-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 ${
                  errors.name && touched.name
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-gray-700/50 focus:border-orange-500"
                } rounded-xl text-lg text-white placeholder:text-gray-500 focus:outline-none transition-all duration-300`}
              />
              {errors.name && touched.name && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>
              )}
            </div>

            {/* Unit Selection - Card Grid */}
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
                  <Beaker size={12} /> Initial Stock
                </label>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    name="stock"
                    value={values.stock}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full h-10 bg-transparent text-2xl font-bold text-white focus:outline-none"
                    min="0"
                  />
                  <span className="text-gray-500 text-sm">{values.unit}</span>
                </div>
                {errors.stock && touched.stock && (
                  <p className="text-red-400 text-xs mt-1">{errors.stock}</p>
                )}
              </div>

              {/* Cost Per Unit */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <DollarSign size={12} /> Cost per {values.unit}
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-500">Rs.</span>
                  <input
                    type="number"
                    name="costPerUnit"
                    value={values.costPerUnit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full h-10 bg-transparent text-2xl font-bold text-green-400 focus:outline-none"
                    min="0"
                  />
                </div>
                {errors.costPerUnit && touched.costPerUnit && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.costPerUnit}
                  </p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
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
                    You'll receive an alert when stock falls below this level
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={values.lowStockThreshold}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-24 h-8 px-3 bg-gray-900/50 border border-orange-500/30 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                    <span className="text-gray-500 text-sm">{values.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
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
