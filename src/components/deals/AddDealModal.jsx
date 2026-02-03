"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { createDealAction, updateDealAction } from "@/app/actions/deals"; // Updated import
import { getProductsAction } from "@/app/actions/products";
import {
  calculateSavings,
  calculateTotalOriginalPrice,
} from "@/lib/pricing-utils";
import ImageUploader from "@/components/ui/ImageUploader";

// Sub-components
import DealInfoSection from "./sections/DealInfoSection";
import DealPricingSection from "./sections/DealPricingSection";
import MenuItemsSelector from "./sections/MenuItemsSelector";
import InventoryAddonsSelector from "./sections/InventoryAddonsSelector";

// Validation Schema
const dealSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Deal name is required"),
  description: Yup.string().max(200, "Description is too long"),
  originalPrice: Yup.number().min(0, "Cannot be negative").required("Required"),
  dealPrice: Yup.number().min(0, "Cannot be negative").required("Required"),
});

const emptyValues = {
  name: "",
  description: "",
  originalPrice: "",
  dealPrice: "",
  image: "",
};

export default function AddDealModal({ isOpen, onClose, onAdd, deal }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const isEditMode = !!deal;

  // Initialize values
  const initialValues = useMemo(() => {
    if (deal) {
      return {
        name: deal.name || "",
        description: deal.description || "",
        originalPrice: deal.originalPrice || "",
        dealPrice: deal.dealPrice || "",
        image: deal.image || "",
      };
    }
    return emptyValues;
  }, [deal]);

  // Fetch products
  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        const res = await getProductsAction({ includeInventory: "true" });
        if (res?.success) {
          setAvailableProducts(res.data || []);
        }
      };
      fetchProducts();

      // Initialize selected products if editing
      if (deal && deal.products) {
        // deal.products is likely an array of IDs if from DB, check structure
        // If it's objects, map to IDs.
        // Based on schema, it stores string[], so it should be fine.
        setSelectedProducts(deal.products || []);
      } else {
        setSelectedProducts([]);
      }

      setMenuSearch("");
    }
  }, [isOpen, deal]);

  // Derived state for filtering
  const menuItems = useMemo(
    () =>
      availableProducts.filter(
        (p) =>
          !p.isInventoryOnly &&
          p.name.toLowerCase().includes(menuSearch.toLowerCase()),
      ),
    [availableProducts, menuSearch],
  );

  const inventoryItems = useMemo(
    () =>
      availableProducts.filter((p) => p.isInventoryOnly && !p.isServiceSupply),
    [availableProducts],
  );

  const filteredInventory = useMemo(
    () => inventoryItems.filter((p) => !selectedProducts.includes(p.id)),
    [inventoryItems, selectedProducts],
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const dealData = {
        ...values,
        originalPrice: parseFloat(values.originalPrice) || 0,
        dealPrice: parseFloat(values.dealPrice) || 0,
        products: selectedProducts,
        isActive: deal ? deal.isActive : true,
      };

      let result;
      if (isEditMode) {
        result = await updateDealAction(deal.id, dealData);
      } else {
        result = await createDealAction(dealData);
      }

      if (result.success) {
        onAdd?.(result.data); // Notify parent to refresh
        resetForm();
        setSelectedProducts([]);
        onClose();
      } else {
        alert(result.error || "Failed to save deal");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Exclusive Bundle" : "Create Exclusive Bundle"}
      className="max-w-6xl w-full p-0 overflow-hidden"
      noPadding={true}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={dealSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => {
          // Function to handle selection changes
          const handleSelectionChange = (id, isAdding) => {
            const newSelection = isAdding
              ? [...selectedProducts, id]
              : selectedProducts.filter((pid) => pid !== id);

            setSelectedProducts(newSelection);

            // Auto calculate original price if creating new deal or explicitly requested
            // (Optional: maybe keep manual entry flexible)
            const newTotal = calculateTotalOriginalPrice(
              availableProducts,
              newSelection,
            );
            if (newTotal > 0) {
              setFieldValue("originalPrice", newTotal);
            }
          };

          const savings = calculateSavings(
            values.originalPrice,
            values.dealPrice,
          );

          return (
            <Form className="flex flex-col h-[85vh] md:h-[800px]">
              {/* TOP: Image Uploader Header */}
              <div className="bg-gray-900 border-b border-gray-800 p-6 shrink-0">
                <ImageUploader
                  value={values.image}
                  onChange={(url) => setFieldValue("image", url)}
                  folder="grill-x/deals"
                  placeholder="Upload Deal Cover Image (1200x600 recommended)"
                  className="h-48 w-full object-cover rounded-xl border-2 border-dashed border-gray-700 hover:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* LEFT SIDEBAR: Config & Pricing */}
                <div className="w-full md:w-[400px] bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6 shrink-0">
                  <DealInfoSection
                    values={values}
                    setFieldValue={setFieldValue}
                  />
                  <hr className="border-gray-800" />
                  <DealPricingSection values={values} savings={savings} />
                </div>

                {/* RIGHT MAIN AREA: Product Selection */}
                <div className="flex-1 bg-gray-950/30 flex flex-col overflow-hidden relative min-h-0">
                  <div className="p-6 pb-2 shrink-0">
                    <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
                      <Package size={18} className="text-blue-500" />
                      Build Bundle
                      <span className="text-xs font-normal text-gray-500 ml-2 bg-gray-800 px-2 py-0.5 rounded-full">
                        {selectedProducts.length} items selected
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      Select items to include in this deal.
                    </p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scrollbar">
                    <MenuItemsSelector
                      menuItems={menuItems}
                      selectedProducts={selectedProducts}
                      menuSearch={menuSearch}
                      setMenuSearch={setMenuSearch}
                      onToggle={handleSelectionChange}
                    />
                    <InventoryAddonsSelector
                      filteredInventory={filteredInventory}
                      selectedProducts={selectedProducts}
                      availableProducts={availableProducts}
                      onAdd={(id) => handleSelectionChange(id, true)}
                      onRemove={(id) => handleSelectionChange(id, false)}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t border-gray-800 bg-gray-900/80 backdrop-blur p-4 flex justify-between items-center shrink-0">
                <div className="text-xs text-gray-500 hidden sm:block">
                  Total Bundle Value: Rs. {values.originalPrice}
                </div>
                <div className="flex items-center gap-3 ml-auto">
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
                    disabled={isSubmitting || selectedProducts.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-900/20 px-8"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : isEditMode
                        ? "Update Bundle"
                        : "Create Bundle"}
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
