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
import { Plus, X, Image as ImageIcon, Flame, DollarSign } from "lucide-react";
import { createProductAction } from "@/app/actions/products";
import { getIngredientsAction } from "@/app/actions/ingredients";

// Size configurations by category
const SIZE_CONFIG = {
  Pizza: ["Small", "Medium", "Large", "Extra Large"],
  Pasta: ["Regular", "Large"],
  Burgers: ["Single", "Double"],
  Drinks: ["Small", "Medium", "Large"],
};

// Categories that support sizes
const CATEGORIES_WITH_SIZES = Object.keys(SIZE_CONFIG);

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchIngredients = async () => {
        const res = await getIngredientsAction();
        if (res?.success) {
          setAvailableIngredients(res.data);
        }
      };
      fetchIngredients();
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
    // Size variants - will be populated based on category
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

  // Initialize variants when category changes
  const handleCategoryChange = (e, setFieldValue, values) => {
    const newCategory = e.target.value;
    setFieldValue("category", newCategory);

    // If category has sizes, initialize variant prices
    const sizes = getSizesForCategory(newCategory);
    if (sizes.length > 0) {
      const newVariants = sizes.map((size, index) => ({
        size,
        price: "",
        isDefault: index === Math.floor(sizes.length / 2), // Middle size is default
      }));
      setFieldValue("variants", newVariants);
    } else {
      setFieldValue("variants", []);
    }
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

      const productData = {
        name: values.name,
        description: values.description,
        basePrice: parseFloat(values.basePrice) || 0,
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

      const result = await createProductAction(productData);

      if (result.success) {
        if (onAdd) {
          onAdd(result.data);
        }
        resetForm();
        onClose();
      } else {
        console.error("Failed to add product:", result.error);
        alert(result.error);
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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Category
                      </label>
                      <select
                        name="category"
                        value={values.category}
                        onChange={(e) =>
                          handleCategoryChange(e, setFieldValue, values)
                        }
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Burgers">Burgers</option>
                        <option value="Steaks">Steaks</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Pasta">Pasta</option>
                        <option value="Appetizers">Appetizers</option>
                        <option value="Drinks">Drinks</option>
                      </select>
                    </div>

                    {/* Base price - shown when no sizes OR as minimum price */}
                    <FormInput
                      label={
                        categoryHasSizes(values.category)
                          ? "Base Price (Rs.)"
                          : "Price (Rs.)"
                      }
                      name="basePrice"
                      type="number"
                      placeholder="0.00"
                      min="0"
                    />
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
                    <p className="text-sm text-gray-400 mb-4">
                      Set prices for each size. Leave empty to exclude a size.
                    </p>

                    <div className="space-y-3">
                      {values.variants.map((variant, index) => (
                        <div
                          key={variant.size}
                          className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="text-white font-medium">
                              {variant.size}
                            </span>
                            {variant.isDefault && (
                              <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="w-32">
                            <input
                              name={`variants[${index}].price`}
                              value={variant.price}
                              onChange={handleChange}
                              type="number"
                              placeholder="Rs."
                              min="0"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newVariants = values.variants.map(
                                (v, i) => ({
                                  ...v,
                                  isDefault: i === index,
                                }),
                              );
                              setFieldValue("variants", newVariants);
                            }}
                            className={`px-3 py-1 rounded text-xs ${
                              variant.isDefault
                                ? "bg-orange-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            Default
                          </button>
                        </div>
                      ))}
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
                                    <label className="text-xs text-gray-500 mb-1 block">
                                      Ingredient
                                    </label>
                                    <select
                                      name={`recipeData[${index}].ingredientId`}
                                      value={item.ingredientId}
                                      onChange={handleChange}
                                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                      <option value="">
                                        Select Ingredient
                                      </option>
                                      {availableIngredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                          {ing.name} (stored: {ing.unit})
                                        </option>
                                      ))}
                                    </select>
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
                                    <label className="text-xs text-gray-500 mb-1 block">
                                      Unit
                                    </label>
                                    <select
                                      name={`recipeData[${index}].unit`}
                                      value={item.unit || ""}
                                      onChange={handleChange}
                                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                      <option value="">--</option>
                                      <option value="g">g</option>
                                      <option value="kg">kg</option>
                                      <option value="ml">ml</option>
                                      <option value="l">l</option>
                                      <option value="pcs">pcs</option>
                                    </select>
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
                    folder="grill-x/products"
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
