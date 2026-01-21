"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { FormInput, FormTextarea } from "@/components/ui/form-components";
import ImageUploader from "@/components/ui/ImageUploader";
import { Tag, DollarSign, Package } from "lucide-react";
import { createDealAction } from "@/app/actions/deals";
import { getProductsAction } from "@/app/actions/products";

const dealSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Deal name is required"),
  description: Yup.string(),
  originalPrice: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Original price is required"),
  dealPrice: Yup.number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .required("Deal price is required"),
});

export default function AddDealModal({ isOpen, onClose, onAdd }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        const res = await getProductsAction();
        if (res?.success) {
          setAvailableProducts(res.data);
        }
      };
      fetchProducts();
      setSelectedProducts([]);
    }
  }, [isOpen]);

  const initialValues = {
    name: "",
    description: "",
    originalPrice: "",
    dealPrice: "",
    image: "",
  };

  const toggleProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const dealData = {
        name: values.name,
        description: values.description,
        originalPrice: parseFloat(values.originalPrice) || 0,
        dealPrice: parseFloat(values.dealPrice) || 0,
        image: values.image,
        products: selectedProducts,
        isActive: true,
      };

      const result = await createDealAction(dealData);

      if (result.success) {
        if (onAdd) {
          onAdd(result.data);
        }
        resetForm();
        setSelectedProducts([]);
        onClose();
      } else {
        console.error("Failed to add deal:", result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error("Error adding deal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSavings = (original, deal) => {
    const orig = parseFloat(original) || 0;
    const dealP = parseFloat(deal) || 0;
    if (orig <= 0) return 0;
    return Math.round(((orig - dealP) / orig) * 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Deal"
      className="max-w-[900px] w-full"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={dealSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="flex flex-col gap-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-7 space-y-5">
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag className="text-orange-500" size={20} />
                    Deal Details
                  </h3>

                  <div className="space-y-4">
                    <FormInput
                      label="Deal Name"
                      name="name"
                      placeholder="e.g., Family Feast Bundle"
                    />
                    <FormTextarea
                      label="Description"
                      name="description"
                      placeholder="Describe what's included..."
                      rows="2"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="text-green-500" size={20} />
                    Pricing
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Original Price (Rs.)"
                      name="originalPrice"
                      type="number"
                      placeholder="0"
                      min="0"
                    />
                    <FormInput
                      label="Deal Price (Rs.)"
                      name="dealPrice"
                      type="number"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {values.originalPrice && values.dealPrice && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-green-400 font-medium">
                        💰{" "}
                        {calculateSavings(
                          values.originalPrice,
                          values.dealPrice,
                        )}
                        % OFF
                      </span>
                      <span className="text-gray-400 ml-2">
                        Save Rs.{" "}
                        {(
                          parseFloat(values.originalPrice) -
                          parseFloat(values.dealPrice)
                        ).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Products Selection */}
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Package className="text-blue-500" size={20} />
                    Included Products
                  </h3>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableProducts.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No products available
                      </p>
                    ) : (
                      availableProducts.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedProducts.includes(product.id)
                              ? "bg-orange-500/20 border border-orange-500/40"
                              : "bg-gray-900/50 border border-transparent hover:bg-gray-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProduct(product.id)}
                            className="accent-orange-500"
                          />
                          <span className="text-white">{product.name}</span>
                          <span className="text-gray-500 text-sm ml-auto">
                            Rs. {product.basePrice || product.price}
                          </span>
                        </label>
                      ))
                    )}
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="mt-3 text-sm text-gray-400">
                      {selectedProducts.length} product(s) selected
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="col-span-12 lg:col-span-5 space-y-5">
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    📸 Deal Image
                  </h3>
                  <ImageUploader
                    value={values.image}
                    onChange={(url) => setFieldValue("image", url)}
                    folder="grill-x/deals"
                    placeholder="Click to upload deal image"
                  />
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-5 rounded-xl border border-orange-500/20">
                  <h4 className="text-white font-medium mb-2">💡 Tip</h4>
                  <p className="text-sm text-gray-400">
                    Deals are bundles of products at discounted prices. Select
                    products to include and set competitive pricing.
                  </p>
                </div>
              </div>
            </div>

            <ModalFooter className="bg-gray-900/50 py-4 px-6 -mx-6 -mb-6 border-t border-gray-800 flex justify-between items-center">
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
                  {isSubmitting ? "Creating..." : "Create Deal"}
                </Button>
              </div>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
