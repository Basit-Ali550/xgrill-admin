"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form } from "formik";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { productSchema } from "@/lib/validations";
import { api } from "@/lib/api";
import { useIngredients } from "@/hooks/useIngredients";
import { calculateProductionCost } from "@/lib/pricing-utils";
import { CATEGORIES_WITH_SIZES } from "@/constants";

// Sub-components
import ProductImageSection from "./sections/ProductImageSection";
import ProductDetailsSection from "./sections/ProductDetailsSection";
import RecipeSection from "./sections/RecipeSection";
import SimplePricingSection from "./sections/SimplePricingSection";
import VariantPricingSection from "./sections/VariantPricingSection";

const emptyValues = {
  name: "",
  description: "",
  basePrice: "",
  category: "Burgers",
  ingredients: [],
  recipeData: [],
  image: "",
  variants: [],
};

const categoryHasSizes = (category) => CATEGORIES_WITH_SIZES.includes(category);

export default function AddProductModal({ isOpen, onClose, onAdd, product }) {
  const { ingredients: availableIngredients, fetchIngredients } =
    useIngredients();

  // Local state for pricing calculator
  const [profit, setProfit] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [variantPrice, setVariantPrice] = useState("");

  // Check if we're in edit mode
  const isEditMode = Boolean(product?.id);

  // Build initial values based on product prop (for edit) or empty (for create)
  const initialValues = useMemo(() => {
    if (!product) return emptyValues;

    return {
      name: product.name || "",
      description: product.description || "",
      basePrice: product.basePrice || product.price || "",
      category: product.category || "Burgers",
      ingredients: product.ingredients || [],
      recipeData: (product.recipe || []).map((r) => ({
        ingredientId: r.ingredientId,
        quantityRequired: r.quantityRequired,
        unit: r.unit || "g",
      })),
      image: product.image || "",
      variants: (product.variants || []).map((v) => ({
        size: v.size,
        price: v.price,
        isDefault: v.isDefault || false,
      })),
    };
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      fetchIngredients();
      setSelectedSize("");
      setVariantPrice("");
      setProfit("");
    }
  }, [isOpen]);

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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
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

      let res;
      if (isEditMode) {
        // Update existing product
        res = await api.put(`/api/v1/products/${product.id}`, payload);
      } else {
        // Create new product
        res = await api.post("/api/v1/products", payload);
      }

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
      title={isEditMode ? "Edit Product" : "Add New Product"}
      className="max-w-4xl w-full p-0"
      noPadding={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={productSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, handleChange, setFieldValue }) => {
          const productionCost = calculateProductionCost(
            values.recipeData,
            availableIngredients,
          );

          return (
            <Form className="flex flex-col flex-1 min-h-0 bg-gray-950 text-gray-200 font-sans">
              {/* Content Area */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* 1. IDENTITY & IMAGE */}
                <section className="space-y-6">
                  <ProductImageSection
                    image={values.image}
                    setFieldValue={setFieldValue}
                  />
                  <ProductDetailsSection
                    values={values}
                    handleCategoryChange={(e) =>
                      handleCategoryChange(e, setFieldValue)
                    }
                  />
                </section>

                {/* 2. RECIPE (COSTING) */}
                <RecipeSection
                  recipeData={values.recipeData}
                  availableIngredients={availableIngredients}
                  productionCost={productionCost}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                />

                {/* 3. PRICING & PROFIT */}
                <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Pricing & Profit
                  </h3>

                  {categoryHasSizes(values.category) ? (
                    <VariantPricingSection
                      category={values.category}
                      productionCost={productionCost}
                      variants={values.variants}
                      selectedSize={selectedSize}
                      setSelectedSize={setSelectedSize}
                      variantPrice={variantPrice}
                      setVariantPrice={setVariantPrice}
                      profit={profit}
                      setProfit={setProfit}
                      onAddVariant={() => {
                        handleAddVariant(values, setFieldValue);
                        setProfit("");
                      }}
                      onRemoveVariant={(i) =>
                        handleRemoveVariant(i, values, setFieldValue)
                      }
                    />
                  ) : (
                    <SimplePricingSection
                      productionCost={productionCost}
                      profit={profit}
                      setProfit={setProfit}
                      values={values}
                      setFieldValue={setFieldValue}
                      handleChange={handleChange}
                    />
                  )}
                </section>
              </div>

              {/* FOOTER */}
              <div className="shrink-0 p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
