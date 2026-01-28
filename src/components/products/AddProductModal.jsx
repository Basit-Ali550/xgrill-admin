"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import {
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/ui/form-components";
import ImageUploader from "@/components/ui/ImageUploader";
import { productSchema } from "@/lib/validations";
import { api } from "@/lib/api";
import { useIngredients } from "@/hooks/useIngredients";
import { Plus, X, Image as ImageIcon, Flame, DollarSign } from "lucide-react";

import {
  PRODUCT_CATEGORIES,
  RECIPE_UNITS,
  IMAGE_UPLOAD_FOLDERS,
  SIZE_CONFIG,
  CATEGORIES_WITH_SIZES,
} from "@/constants";

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  // Use client hook to fetch ingredients (hooks handle client-side fetching)
  const { ingredients: availableIngredients, fetchIngredients } =
    useIngredients();
  const [selectedSize, setSelectedSize] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Trigger client-side fetch when modal opens
      try {
        fetchIngredients();
      } catch (err) {
        console.error("Failed to fetch ingredients:", err);
      }

      // Reset local state when modal opens
      setSelectedSize("");
      setVariantPrice("");
    }
  }, [isOpen]);

  const initialValues = {
    name: "",
    description: "",
    basePrice: "",
    category: "Burgers",
    ingredients: [],
    recipeData: [],
    image: "",
    // Size variants - will be populated dynamically
    variants: [],
  };

  // Get sizes for a category
  const getSizesForCategory = (category) => {
    return SIZE_CONFIG[category] || [];
  };

  // Check if category has sizes
  const categoryHasSizes = (category) => {
    return CATEGORIES_WITH_SIZES.includes(category);
  };

  // Category change handler
  const handleCategoryChange = (e, setFieldValue, values) => {
    const newCategory = e.target.value;
    setFieldValue("category", newCategory);
    // Reset variants when category changes
    setFieldValue("variants", []);
    setSelectedSize("");
    setVariantPrice("");
  };

  const handleAddVariant = (values, setFieldValue) => {
    if (!selectedSize || !variantPrice) return;

    // Check if size already exists
    if (values.variants.some((v) => v.size === selectedSize)) {
      alert("This size has already been added.");
      return;
    }

    const newVariant = {
      size: selectedSize,
      price: variantPrice,
      isDefault: values.variants.length === 0, // First one is default
    };

    setFieldValue("variants", [...values.variants, newVariant]);
    setSelectedSize("");
    setVariantPrice("");
  };

  const handleRemoveVariant = (index, values, setFieldValue) => {
    const newVariants = values.variants.filter((_, i) => i !== index);

    // If we removed the default, make the first one default (if exists)
    if (values.variants[index].isDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }

    setFieldValue("variants", newVariants);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const cleanedIngredients = values.ingredients.filter(
        (ing) => ing.trim() !== "",
      );

      const cleanedRecipeData = values.recipeData.filter(
        (item) => item.ingredientId && item.quantityRequired,
      );

      // Filter variants with valid prices
      const cleanedVariants = values.variants.filter(
        (v) => v.price && parseFloat(v.price) > 0,
      );

      // Validation: If category expects sizes but none added, show error
      if (categoryHasSizes(values.category) && cleanedVariants.length === 0) {
        alert(`Please add at least one size for ${values.category}`);
        setSubmitting(false);
        return;
      }

      // Determine final base price
      let finalBasePrice = parseFloat(values.basePrice) || 0;

      // If we have variants, the base price should be the price of the default variant
      // or the first variant if no default is explicitly set (though logic usually enforces default)
      if (cleanedVariants.length > 0) {
        const defaultVariant =
          cleanedVariants.find((v) => v.isDefault) || cleanedVariants[0];
        if (defaultVariant) {
          finalBasePrice = parseFloat(defaultVariant.price);
        }
      }

      const productData = {
        name: values.name,
        description: values.description,
        basePrice: finalBasePrice,
        image: values.image,
        category: values.category,
        ingredients: cleanedIngredients,
        recipeData: cleanedRecipeData,
        hasSizes: cleanedVariants.length > 0,
        variants: cleanedVariants.map((v) => ({
          size: v.size,
          price: parseFloat(v.price),
          isDefault: v.isDefault,
        })),
      };

      try {
        const res = await api.post("/api/v1/products", productData);

        if (res?.success) {
          if (onAdd) onAdd(res.data);
          resetForm();
          onClose();
        } else {
          console.error("Failed to add product:", res?.error || res);
          alert(res?.error || "Failed to add product");
        }
      } catch (err) {
        console.error("Error creating product:", err);
        alert(err.message || "Error creating product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Product"
      className="max-w-[1200px] w-full"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, handleChange, setFieldValue }) => (
          <Form className="flex flex-col gap-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Core Details */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    Product Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <FormInput
                      label="Product Name"
                      name="name"
                      placeholder="e.g., Spicy Double Beef Burger"
                      className="col-span-2"
                    />

                    <FormSelect
                      label="Category"
                      name="category"
                      value={values.category}
                      onChange={(e) =>
                        handleCategoryChange(e, setFieldValue, values)
                      }
                      options={PRODUCT_CATEGORIES}
                      className="bg-gray-900 border-gray-700 focus:ring-orange-500"
                    />

                    {/* Base price - show ONLY when category has NO sizes */}
                    {!categoryHasSizes(values.category) && (
                      <FormInput
                        label="Price (Rs.)"
                        name="basePrice"
                        type="number"
                        placeholder="0.00"
                        min="0"
                      />
                    )}
                  </div>

                  <FormTextarea
                    label="Description"
                    name="description"
                    placeholder="Describe the taste, texture, and key appeal..."
                    rows="3"
                  />
                </div>

                {/* Size Variants Section - Only show for categories with sizes */}
                {categoryHasSizes(values.category) && (
                  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="text-green-500" size={20} />
                      Size & Pricing
                    </h3>

                    {/* Input Area */}
                    <div className="grid grid-cols-12 gap-3 mb-4 items-end bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
                      <div className="col-span-5">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Size
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Size</option>
                          {getSizesForCategory(values.category).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Price
                        </label>
                        <input
                          type="number"
                          placeholder="Rs."
                          value={variantPrice}
                          onChange={(e) => setVariantPrice(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <Button
                          type="button"
                          onClick={() =>
                            handleAddVariant(values, setFieldValue)
                          }
                          disabled={!selectedSize || !variantPrice}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* List of Added Variants */}
                    <div className="space-y-2">
                      {values.variants.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2 italic">
                          No sizes added yet.
                        </p>
                      ) : (
                        values.variants.map((variant, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium w-24">
                                {variant.size}
                              </span>
                              <span className="text-gray-400">
                                Rs. {variant.price}
                              </span>
                              {variant.isDefault && (
                                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded ml-2">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {!variant.isDefault && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newVariants = values.variants.map(
                                      (v, i) => ({
                                        ...v,
                                        isDefault: i === index,
                                      }),
                                    );
                                    setFieldValue("variants", newVariants);
                                  }}
                                  className="h-8 text-xs text-gray-400 hover:text-white"
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleRemoveVariant(
                                    index,
                                    values,
                                    setFieldValue,
                                  )
                                }
                                className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Recipe Section */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="text-green-500">🥦</span> Recipe &
                      Ingredients
                    </h3>
                  </div>

                  <FieldArray name="recipeData">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {availableIngredients.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No ingredients available. Add some in the
                            Ingredients page first.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {values.recipeData &&
                              values.recipeData.map((item, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 group items-end pb-2 border-b border-gray-800 last:border-0"
                                >
                                  <div className="col-span-5">
                                    <FormSelect
                                      label="Ingredient"
                                      name={`recipeData[${index}].ingredientId`}
                                      className="bg-gray-900 border-gray-700 focus:ring-orange-500"
                                      placeholder="Select Ingredient"
                                      options={availableIngredients.map(
                                        (ing) => ({
                                          label: `${ing.name} (stored: ${ing.unit})`,
                                          value: ing.id,
                                        }),
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <label className="text-xs text-gray-500 mb-1 block">
                                      Qty
                                    </label>
                                    <input
                                      name={`recipeData[${index}].quantityRequired`}
                                      value={item.quantityRequired || ""}
                                      onChange={handleChange}
                                      placeholder="0"
                                      type="number"
                                      min="0"
                                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <FormSelect
                                      label="Unit"
                                      name={`recipeData[${index}].unit`}
                                      className="bg-gray-900 border-gray-700 focus:ring-orange-500"
                                      options={RECIPE_UNITS}
                                    />
                                  </div>
                                  <div className="col-span-2 flex justify-end pb-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => remove(index)}
                                      className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors h-10 w-10 p-0"
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            push({
                              ingredientId: "",
                              quantityRequired: "",
                              unit: "",
                            })
                          }
                          className="w-full border-dashed border-gray-600 hover:border-orange-500 hover:text-orange-500"
                          disabled={availableIngredients.length === 0}
                        >
                          <Plus size={16} className="mr-2" /> Add Ingredient to
                          Recipe
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {/* Image Upload */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="text-blue-500" size={20} />
                    Product Image
                  </h3>

                  <ImageUploader
                    value={values.image}
                    onChange={(url) => setFieldValue("image", url)}
                    folder={IMAGE_UPLOAD_FOLDERS.PRODUCTS}
                    placeholder="Click to upload or drag and drop"
                  />

                  <p className="text-xs text-gray-500 mt-3">
                    Upload high-quality product images (max 10MB)
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-xl border border-orange-500/20">
                  <h4 className="text-white font-medium mb-2">💡 Tip</h4>
                  <p className="text-sm text-gray-400">
                    Products are menu items that are made from ingredients.
                    Stock is tracked at the ingredient level, not the product
                    level.
                  </p>
                </div>
              </div>
            </div>

            <ModalFooter className="bg-gray-900/50 mt-0 py-4 px-8 -mx-6 -mb-6 border-t border-gray-800 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Ensure all details are correct before saving.
              </div>
              <div className="flex gap-3">
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
                  className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/20 px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Product..." : "Create Product"}
                </Button>
              </div>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
