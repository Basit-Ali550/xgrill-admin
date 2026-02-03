"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/ui/form-components";
import ImageUploader from "@/components/ui/ImageUploader";
import {
  Tag,
  DollarSign,
  Package,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { createDealAction } from "@/app/actions/deals";
import { getProductsAction } from "@/app/actions/products";

// Validation Schema
const dealSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Deal name is required"),
  description: Yup.string().max(200, "Description is too long"),
  originalPrice: Yup.number().min(0, "Cannot be negative").required("Required"),
  dealPrice: Yup.number().min(0, "Cannot be negative").required("Required"),
});

export default function AddDealModal({ isOpen, onClose, onAdd }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");

  // Fetch products on open
  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        const res = await getProductsAction({ includeInventory: "true" });
        if (res?.success) {
          setAvailableProducts(res.data || []);
        }
      };
      fetchProducts();
      setSelectedProducts([]);
      setMenuSearch("");
    }
  }, [isOpen]);

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
    () =>
      inventoryItems.filter(
        (p) =>
          !selectedProducts.includes(p.id) &&
          p.name.toLowerCase().includes(inventorySearch.toLowerCase()),
      ),
    [inventoryItems, selectedProducts, inventorySearch],
  );

  // Helper to calculate total price of selected items
  const calculateTotalOriginalPrice = (currentSelection) => {
    return currentSelection.reduce((sum, id) => {
      const prod = availableProducts.find((p) => p.id === id);
      return sum + (prod ? parseFloat(prod.basePrice || prod.price) || 0 : 0);
    }, 0);
  };

  const initialValues = {
    name: "",
    description: "",
    originalPrice: "",
    dealPrice: "",
    image: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const dealData = {
        ...values,
        originalPrice: parseFloat(values.originalPrice) || 0,
        dealPrice: parseFloat(values.dealPrice) || 0,
        products: selectedProducts,
        isActive: true,
      };

      const result = await createDealAction(dealData);

      if (result.success) {
        onAdd?.(result.data);
        resetForm();
        setSelectedProducts([]);
        onClose();
      } else {
        alert(result.error || "Failed to create deal");
      }
    } catch (error) {
      console.error(error);
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
      title="Create Exclusive Bundle"
      className="max-w-6xl w-full p-0 overflow-hidden"
      noPadding={true}
    >
      <Formik
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
            setFieldValue(
              "originalPrice",
              calculateTotalOriginalPrice(newSelection),
            );
          };

          const savings = calculateSavings(
            values.originalPrice,
            values.dealPrice,
          );

          return (
            <Form className="flex flex-col h-[80vh] md:h-auto">
              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* LEFT SIDEBAR: Config & Pricing (40%) */}
                <div className="w-full md:w-[400px] bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6">
                  {/* Header/Image */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Tag size={18} className="text-orange-500" />
                      Deal Information
                    </h3>
                    <ImageUploader
                      value={values.image}
                      onChange={(url) => setFieldValue("image", url)}
                      folder="grill-x/deals"
                      placeholder="Upload Deal Cover Image"
                      className="h-40"
                    />
                    <FormInput
                      label="Deal Name"
                      name="name"
                      placeholder="SuperSaver Combo"
                    />
                    <FormTextarea
                      label="Short Description"
                      name="description"
                      placeholder="A tasty mix of..."
                      rows={2}
                    />
                  </div>

                  <hr className="border-gray-800" />

                  {/* Pricing Section */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <DollarSign size={18} className="text-green-500" />
                      Pricing Strategy
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Total Value (Calculated)
                        </label>
                        <div className="h-10 px-3 bg-gray-800/80 border border-gray-700 rounded-lg flex items-center text-gray-300 font-mono text-sm">
                          Rs. {values.originalPrice || 0}
                        </div>
                        {/* Hidden input for Formik binding if needed, but we setFieldValue manually */}
                      </div>
                      <FormInput
                        label="Deal Price (Your Offer)"
                        name="dealPrice"
                        type="number"
                        placeholder="0"
                        className="bg-gray-800 border-gray-700 focus:border-orange-500"
                      />
                    </div>

                    {/* Savings Indicator */}
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        savings > 0
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-gray-800 border-gray-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs text-gray-400">
                          Customer Savings
                        </p>
                        <p
                          className={`text-lg font-bold ${savings > 0 ? "text-green-400" : "text-gray-500"}`}
                        >
                          {savings > 0 ? `${savings}% OFF` : "0%"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Amount Saved</p>
                        <p
                          className={`text-lg font-bold ${savings > 0 ? "text-green-400" : "text-gray-500"}`}
                        >
                          Rs.{" "}
                          {(
                            parseFloat(values.originalPrice || 0) -
                            parseFloat(values.dealPrice || 0)
                          ).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT MAIN AREA: Product Selection (60%) */}
                <div className="flex-1 bg-gray-950/30 flex flex-col overflow-hidden relative">
                  <div className="p-6 pb-2">
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
                    {/* SECTION 1: Menu Items */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-900/40 p-2 rounded-lg border border-gray-800/50">
                        <div className="flex items-center gap-2 px-2">
                          <Utensils size={14} className="text-orange-400" />
                          <span className="text-sm font-medium text-gray-300">
                            Menu Items
                          </span>
                        </div>
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                          />
                          <input
                            type="text"
                            placeholder="Search menu..."
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                            className="h-8 bg-gray-900 border border-gray-700 rounded text-xs text-white pl-8 pr-3 focus:outline-none focus:border-orange-500 w-40 transition-all focus:w-56"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {menuItems.map((product) => {
                          const isSelected = selectedProducts.includes(
                            product.id,
                          );
                          return (
                            <div
                              key={product.id}
                              onClick={() =>
                                handleSelectionChange(product.id, !isSelected)
                              }
                              className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                                isSelected
                                  ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                  : "bg-gray-800/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800"
                              }`}
                            >
                              {/* Selection Indicator */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? "bg-blue-500" : "bg-transparent"}`}
                              />

                              {/* Image Placeholder or Icon */}
                              <div
                                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-500 text-white" : "bg-gray-700/50 text-gray-500"}`}
                              >
                                {isSelected ? (
                                  <Plus size={20} className="rotate-45" />
                                ) : (
                                  <ShoppingBag size={18} />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-sm font-medium truncate ${isSelected ? "text-blue-400" : "text-gray-300 group-hover:text-white"}`}
                                >
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {product.category}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-mono text-gray-400 block">
                                  Rs.{product.basePrice || product.price}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {menuItems.length === 0 && (
                          <div className="col-span-full py-8 text-center text-gray-500 text-sm italic">
                            No matching menu items found.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: Inventory Add-ons */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2 pb-1 border-b border-gray-800">
                        <Package size={14} className="text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">
                          Inventory Add-ons
                        </span>
                        <span className="text-xs text-gray-600">
                          (Drinks, Sides, etc.)
                        </span>
                      </div>

                      <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 space-y-4">
                        {/* Custom Search/Select Input */}
                        <div className="relative">
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                          />
                          <select
                            onChange={(e) => {
                              if (e.target.value)
                                handleSelectionChange(e.target.value, true);
                              e.target.value = "";
                            }}
                            className="w-full h-11 bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                          >
                            <option value="">
                              Find & add inventory item...
                            </option>
                            {filteredInventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — Rs. {item.basePrice || item.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Selected Inventory Tags */}
                        <div className="flex flex-wrap gap-2">
                          {selectedProducts
                            .map((id) =>
                              availableProducts.find((p) => p.id === id),
                            )
                            .filter((p) => p && p.isInventoryOnly)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 pr-1 pl-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full animate-in fade-in zoom-in duration-200"
                              >
                                <span className="text-xs text-purple-200 font-medium">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-purple-400/70 border-l border-purple-500/20 pl-2">
                                  Rs.{item.basePrice || item.price}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectionChange(item.id, false)
                                  }
                                  className="p-1 hover:bg-purple-500/20 rounded-full text-purple-400 hover:text-white transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                              </div>
                            ))}
                          {selectedProducts.filter(
                            (id) =>
                              availableProducts.find((p) => p.id === id)
                                ?.isInventoryOnly,
                          ).length === 0 && (
                            <p className="text-xs text-gray-600 py-2 ml-1">
                              No add-ons selected yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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
                    className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-900/20 px-8"
                  >
                    {isSubmitting ? "Creating Bundle..." : "Create Deal"}
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
