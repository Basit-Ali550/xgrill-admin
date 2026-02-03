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
import { Plus, X, Image as ImageIcon } from "lucide-react";

import {
  PRODUCT_CATEGORIES,
  RECIPE_UNITS,
  IMAGE_UPLOAD_FOLDERS,
  SIZE_CONFIG,
  CATEGORIES_WITH_SIZES,
} from "@/constants";

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  const { ingredients: availableIngredients, fetchIngredients } =
    useIngredients();

  // Local state for pricing calculator
  const [profit, setProfit] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchIngredients();
      setSelectedSize("");
      setVariantPrice("");
      setProfit("");
    }
  }, [isOpen]);

  const initialValues = {
    name: "",
    description: "",
    basePrice: "",
    category: "Burgers",
    ingredients: [],
    recipeData: [], // { ingredientId, quantityRequired, unit }
    image: "",
    variants: [],
  };

  const getSizesForCategory = (category) => SIZE_CONFIG[category] || [];
  const categoryHasSizes = (category) =>
    CATEGORIES_WITH_SIZES.includes(category);

  const handleCategoryChange = (e, setFieldValue) => {
    setFieldValue("category", e.target.value);
    setFieldValue("variants", []);
    setSelectedSize("");
    setVariantPrice("");
  };

  const handleAddVariant = (values, setFieldValue) => {
    if (!selectedSize || !variantPrice) return;
    if (values.variants.some((v) => v.size === selectedSize)) {
      alert("Size already added.");
      return;
    }
    const newVariant = {
      size: selectedSize,
      price: variantPrice,
      isDefault: values.variants.length === 0,
    };
    setFieldValue("variants", [...values.variants, newVariant]);
    setSelectedSize("");
    setVariantPrice("");
  };

  const handleRemoveVariant = (index, values, setFieldValue) => {
    const newVariants = values.variants.filter((_, i) => i !== index);
    if (values.variants[index].isDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }
    setFieldValue("variants", newVariants);
  };

  // --- COST CALCULATION HELPER ---
  const calculateProductionCost = (recipeData) => {
    return recipeData.reduce((sum, item) => {
      const ing = availableIngredients.find((i) => i.id === item.ingredientId);
      if (!ing) return sum;

      let qty = parseFloat(item.quantityRequired) || 0;
      const from = item.unit;
      const to = ing.unit;

      if (from !== to) {
        if (from === "g" && to === "kg") qty /= 1000;
        else if (from === "kg" && to === "g") qty *= 1000;
        else if (from === "ml" && to === "l") qty /= 1000;
        else if (from === "l" && to === "ml") qty *= 1000;
      }

      return sum + qty * (ing.costPerUnit || 0);
    }, 0);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Cleanup Logic
      const cleanedIngredients = values.ingredients.filter(
        (i) => i.trim() !== "",
      );
      const cleanedRecipeData = values.recipeData.filter(
        (i) => i.ingredientId && i.quantityRequired,
      );
      const cleanedVariants = values.variants.filter(
        (v) => parseFloat(v.price) > 0,
      );

      if (categoryHasSizes(values.category) && cleanedVariants.length === 0) {
        alert(`Please add sizes for ${values.category}`);
        setSubmitting(false);
        return;
      }

      let finalBasePrice = parseFloat(values.basePrice) || 0;
      if (cleanedVariants.length > 0) {
        const def =
          cleanedVariants.find((v) => v.isDefault) || cleanedVariants[0];
        finalBasePrice = parseFloat(def.price);
      }

      const payload = {
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

      const res = await api.post("/api/v1/products", payload);
      if (res?.success) {
        if (onAdd) onAdd(res.data);
        resetForm();
        onClose();
      } else {
        alert(res?.error || "Failed");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product"
      className="max-w-4xl w-full p-0"
      noPadding={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, handleChange, setFieldValue }) => {
          const productionCost = calculateProductionCost(values.recipeData);

          return (
            // Fixed height removed to let the Modal handle scrolling
            <Form className="flex flex-col bg-gray-950 text-gray-200 font-sans">
              {/* Content Area */}
              <div className="p-6 space-y-8">
                {/* 1. IDENTITY & IMAGE */}
                <section className="space-y-6">
                  {/* Image Section - Top Full Width */}
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-700 bg-gray-900 group relative">
                    <ImageUploader
                      value={values.image}
                      onChange={(url) => setFieldValue("image", url)}
                      folder={IMAGE_UPLOAD_FOLDERS.PRODUCTS}
                      className="h-full w-full object-cover"
                    />
                    {!values.image && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none bg-gray-900/50 hover:bg-gray-900/40 transition-colors">
                        <ImageIcon size={48} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">
                          Click to Upload Product Image
                        </span>
                        <span className="text-xs text-gray-600 mt-1">
                          Recommended size: 800x800px
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="Product Name"
                        name="name"
                        placeholder="Name"
                        className="bg-gray-900 border-gray-700 focus:border-orange-500"
                      />
                      <FormSelect
                        label="Category"
                        name="category"
                        value={values.category}
                        onChange={(e) => handleCategoryChange(e, setFieldValue)}
                        options={PRODUCT_CATEGORIES}
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <FormTextarea
                      label="Description"
                      name="description"
                      placeholder="Details..."
                      rows="2"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </section>

                {/* 2. RECIPE (COSTING) */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Recipe & Ingredients
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Total Mfg. Cost:
                      </span>
                      <span className="text-xl font-mono font-bold text-orange-400">
                        Rs. {productionCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Removed overflow-hidden to fix dropdown clipping */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg">
                    <FieldArray name="recipeData">
                      {({ push, remove }) => (
                        <div>
                          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-950 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-bold">
                            <div className="col-span-12 lg:col-span-5">
                              Ingredient
                            </div>
                            <div className="col-span-3">Qty</div>
                            <div className="col-span-2">Unit</div>
                            <div className="col-span-2 text-right">Cost</div>
                          </div>
                          <div className="p-2 space-y-2">
                            {values.recipeData.map((item, index) => {
                              const ing = availableIngredients.find(
                                (i) => i.id === item.ingredientId,
                              );
                              let qty = parseFloat(item.quantityRequired) || 0;
                              // Unit conversion for display
                              if (ing && ing.unit && item.unit !== ing.unit) {
                                if (item.unit === "g" && ing.unit === "kg")
                                  qty /= 1000;
                                else if (item.unit === "kg" && ing.unit === "g")
                                  qty *= 1000;
                                else if (item.unit === "ml" && ing.unit === "l")
                                  qty /= 1000;
                                else if (item.unit === "l" && ing.unit === "ml")
                                  qty *= 1000;
                              }
                              const cost = qty * (ing?.costPerUnit || 0);

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 items-center"
                                >
                                  <div className="col-span-12 lg:col-span-5">
                                    <FormSelect
                                      name={`recipeData[${index}].ingredientId`}
                                      className="bg-gray-800 border-transparent text-xs h-8"
                                      // UPDATED: Include unit in label
                                      options={availableIngredients.map(
                                        (i) => ({
                                          label: `${i.name} (${i.unit})`,
                                          value: i.id,
                                        }),
                                      )}
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <FormInput
                                      name={`recipeData[${index}].quantityRequired`}
                                      type="number"
                                      placeholder="0"
                                      className="bg-gray-800 border-transparent h-8 text-xs px-2"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <select
                                      name={`recipeData[${index}].unit`}
                                      onChange={handleChange}
                                      value={item.unit}
                                      className="w-full bg-gray-800 border-transparent rounded text-xs h-8 px-1 text-gray-300"
                                    >
                                      {(() => {
                                        if (!ing || !ing.unit)
                                          return RECIPE_UNITS.map((u) => (
                                            <option
                                              key={u.value}
                                              value={u.value}
                                            >
                                              {u.label}
                                            </option>
                                          ));
                                        const mass = ["g", "kg"],
                                          vol = ["ml", "l"];
                                        let opts = RECIPE_UNITS;
                                        if (mass.includes(ing.unit))
                                          opts = RECIPE_UNITS.filter((u) =>
                                            mass.includes(u.value),
                                          );
                                        else if (vol.includes(ing.unit))
                                          opts = RECIPE_UNITS.filter((u) =>
                                            vol.includes(u.value),
                                          );
                                        else
                                          opts = [
                                            {
                                              label: ing.unit,
                                              value: ing.unit,
                                            },
                                          ];
                                        return opts.map((u) => (
                                          <option key={u.value} value={u.value}>
                                            {u.label}
                                          </option>
                                        ));
                                      })()}
                                    </select>
                                  </div>
                                  <div className="col-span-2 flex justify-end gap-2 items-center">
                                    <span className="text-xs font-mono text-gray-400">
                                      {cost > 0 ? cost.toFixed(1) : "-"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => remove(index)}
                                      className="text-gray-600 hover:text-red-400"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                push({
                                  ingredientId: "",
                                  quantityRequired: "",
                                  unit: "g",
                                })
                              }
                              className="w-full text-xs border border-dashed border-gray-700 text-gray-500 hover:text-blue-400 mt-2"
                            >
                              + Add Ingredient
                            </Button>
                          </div>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </section>

                {/* 3. PRICING & PROFIT */}
                <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Pricing & Profit
                  </h3>

                  {categoryHasSizes(values.category) ? (
                    // RESTORED PREMIUM LAYOUT FOR VARIANTS WITH PROFIT CALC
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Size Variants</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider">
                            Mfg Cost:{" "}
                            <span className="text-orange-400 font-mono">
                              Rs.{productionCost.toFixed(0)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Variant Entry Row */}
                      <div className="grid grid-cols-12 gap-2 items-end">
                        {/* Size */}
                        <div className="col-span-4">
                          <label className="text-[10px] text-gray-500 mb-1 block">
                            Size
                          </label>
                          <select
                            className="w-full bg-gray-800 border-gray-700 rounded-lg text-sm px-3 py-2 text-white focus:ring-orange-500 focus:border-orange-500"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                          >
                            <option value="">Select</option>
                            {getSizesForCategory(values.category).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Profit */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-blue-400 mb-1 block">
                            Profit
                          </label>
                          <input
                            type="number"
                            className="w-full bg-gray-800 border-blue-500/30 rounded-lg px-3 py-2 text-sm text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Profit"
                            value={profit} // Reusing the 'profit' state usually used for single items, or we can make a new one?
                            // Actually, let's use a temp local state for variant entry if 'profit' is bound to the single item view?
                            // 'profit' state is defined at top level. We can reuse it since only one mode is active at a time.
                            onChange={(e) => {
                              const p = parseFloat(e.target.value) || 0;
                              setProfit(e.target.value);
                              setVariantPrice((productionCost + p).toFixed(0));
                            }}
                          />
                        </div>

                        {/* Price */}
                        <div className="col-span-3">
                          <label className="text-[10px] text-green-500 mb-1 block">
                            Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-gray-500 text-xs">
                              Rs.
                            </span>
                            <input
                              type="number"
                              className="w-full bg-gray-800 border-green-500/30 rounded-lg pl-6 pr-2 py-2 text-sm text-white focus:ring-green-500 focus:border-green-500 font-bold"
                              placeholder="0"
                              value={variantPrice}
                              onChange={(e) => {
                                const price = parseFloat(e.target.value) || 0;
                                setVariantPrice(e.target.value);
                                setProfit((price - productionCost).toFixed(0));
                              }}
                            />
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="col-span-2">
                          <Button
                            type="button"
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                            onClick={() => {
                              handleAddVariant(values, setFieldValue);
                              setProfit(""); // Reset profit after add
                            }}
                            disabled={!selectedSize || !variantPrice}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Variants List */}
                      <div className="space-y-2 mt-2">
                        {values.variants.map((v, i) => {
                          // Calc implied profit for display
                          const impliedProfit = (
                            v.price - productionCost
                          ).toFixed(0);
                          return (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-gray-800/40 px-3 py-2 rounded border border-gray-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-white font-medium text-sm">
                                  {v.size}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  (Profit:{" "}
                                  <span
                                    className={
                                      impliedProfit >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }
                                  >
                                    {impliedProfit}
                                  </span>
                                  )
                                </span>
                                {v.isDefault && (
                                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400 font-mono font-bold">
                                  Rs. {v.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveVariant(
                                      i,
                                      values,
                                      setFieldValue,
                                    )
                                  }
                                  className="text-gray-500 hover:text-red-400"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-6 items-end">
                      {/* A. Mfg Cost */}
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Mfg. Cost
                        </label>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 font-mono text-lg h-[46px] flex items-center">
                          {productionCost.toFixed(0)}
                        </div>
                      </div>

                      {/* B. Profit Input */}
                      <div>
                        <FormInput
                          label="+ Your Profit"
                          name="profit"
                          type="number"
                          value={profit}
                          placeholder="Add"
                          onChange={(e) => {
                            const p = parseFloat(e.target.value) || 0;
                            setProfit(e.target.value);
                            setFieldValue(
                              "basePrice",
                              (productionCost + p).toFixed(0),
                            );
                          }}
                          className="bg-gray-800 border-blue-500/30 focus:border-blue-500 text-white font-mono text-lg font-bold"
                        />
                      </div>

                      {/* C. Final Price */}
                      <div>
                        <FormInput
                          label="= Selling Price"
                          name="basePrice"
                          type="number"
                          value={values.basePrice}
                          onChange={(e) => {
                            handleChange(e);
                            const price = parseFloat(e.target.value) || 0;
                            setProfit((price - productionCost).toFixed(0));
                          }}
                          className="bg-gray-950 border-green-500/50 text-green-400 font-mono text-lg font-bold"
                        />
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* FOOTER */}
              <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                >
                  {isSubmitting ? "Saving..." : "Create Product"}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
