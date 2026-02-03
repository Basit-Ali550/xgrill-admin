"use client";
import React from "react";
import {
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/ui/form-components";
import { PRODUCT_CATEGORIES } from "@/constants";
export default function ProductDetailsSection({
  values,
  handleCategoryChange,
}) {
  return (
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
          onChange={handleCategoryChange}
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
  );
}
