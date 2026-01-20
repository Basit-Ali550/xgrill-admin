"use client";
import React from "react";
import { Formik, Form, FieldArray } from "formik";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import {
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/ui/form-components";
import { productSchema } from "@/lib/validations";
import { Plus, X, Image as ImageIcon, Flame } from "lucide-react";
import { createProductAction } from "@/app/actions/products";

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  const initialValues = {
    name: "",
    description: "",
    price: "",
    category: "Burgers",
    ingredients: [""],
    image: "",
    initialStock: "100",
    lowStockThreshold: "10",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const cleanedIngredients = values.ingredients.filter(
        (ing) => ing.trim() !== "",
      );

      const productData = {
        ...values,
        ingredients: cleanedIngredients,
        price: parseFloat(values.price),
        initialStock: parseInt(values.initialStock),
        lowStockThreshold: parseInt(values.lowStockThreshold),
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
        // Optionally show visual error to user here using toast or alert
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
        {({ values, isSubmitting }) => (
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

                    <FormSelect label="Category" name="category">
                      <option value="Burgers">Burgers</option>
                      <option value="Steaks">Steaks</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Appetizers">Appetizers</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Deals">Deals</option>
                    </FormSelect>

                    <FormInput
                      label="Price (Rs.)"
                      name="price"
                      type="number"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>

                  <FormTextarea
                    label="Description"
                    name="description"
                    placeholder="Describe the taste, texture, and key appeal..."
                    rows="4"
                  />
                </div>

                {/* Ingredients Section */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="text-green-500">🥦</span> Ingredients
                    </h3>
                  </div>

                  <FieldArray name="ingredients">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {values.ingredients.map((_, index) => (
                            <div key={index} className="flex gap-2 group">
                              <FormInput
                                name={`ingredients[${index}]`}
                                placeholder={`Ingredient ${index + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => remove(index)}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                disabled={values.ingredients.length === 1}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => push("")}
                          className="w-full border-dashed border-gray-600 hover:border-orange-500 hover:text-orange-500"
                        >
                          <Plus size={16} className="mr-2" /> Add Another
                          Ingredient
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>

              {/* Right Column: Media & Inventory */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                {/* Image Preview & URL */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="text-blue-500" size={20} />
                    Product Image
                  </h3>

                  <div className="mb-4 aspect-video rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50 flex items-center justify-center overflow-hidden relative">
                    {values.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={values.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <ImageIcon
                          size={48}
                          className="mx-auto mb-2 opacity-50"
                        />
                        <span className="text-sm">
                          Image preview will appear here
                        </span>
                      </div>
                    )}
                  </div>

                  <FormInput
                    label="Image URL"
                    name="image"
                    placeholder="https://source.unsplash.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Use high-quality images from Cloudinary or Unsplash.
                  </p>
                </div>

                {/* Inventory Management */}
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">📦</span> Inventory
                    Control
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Initial Stock"
                      name="initialStock"
                      type="number"
                      min="0"
                      className="bg-gray-900"
                    />

                    <FormInput
                      label="Low Stock Alert"
                      name="lowStockThreshold"
                      type="number"
                      min="0"
                      className="bg-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You will receive alerts when stock falls below the
                    threshold.
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
