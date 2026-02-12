"use client";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/ui/form-components";
import { useAuth } from "@/context/AuthContext";
import {
  INVENTORY_CATEGORIES,
  UNIT_TYPES,
  SIZE_OPTIONS,
  STATUS_OPTIONS,
  ITEM_TYPE_OPTIONS,
  SERVICE_SUPPLY_CATEGORIES,
  SERVICE_SUPPLY_UNITS,
} from "@/constants";
import { Package, Sparkles, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";
import { IMAGE_UPLOAD_FOLDERS } from "@/constants";

// Yup validation schema
const inventoryValidationSchema = Yup.object({
  itemType: Yup.string().required("Item type is required"),
  itemName: Yup.string()
    .required("Item name is required")
    .min(2, "Item name must be at least 2 characters"),
  category: Yup.string().required("Category is required"),
  brand: Yup.string(),
  unitType: Yup.string(),
  size: Yup.string(),
  sellingPrice: Yup.number()
    .when('itemType', {
      is: 'sale',
      then: (schema) => schema.required('Selling price is required').positive('Must be positive'),
      otherwise: (schema) => schema.nullable(),
    })
    .typeError("Selling price must be a number"),
  stock: Yup.number()
    .required("Stock quantity is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .typeError("Stock must be a number"),
  purchasePrice: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .min(0, "Price cannot be negative"),
  minStockAlert: Yup.number()
    .integer("Minimum stock must be a whole number")
    .min(0, "Minimum stock cannot be negative")
    .typeError("Minimum stock must be a number")
    .nullable(),
  expiryDate: Yup.date().nullable().typeError("Invalid date format"),
  status: Yup.string().required("Status is required"),
});

// Initial form values
const initialValues = {
  itemType: "sale",
  itemName: "",
  category: "",
  brand: "",
  unitType: "",
  size: "",
  sellingPrice: "",
  purchasePrice: "",
  stock: "",
  minStockAlert: "",
  expiryDate: "",
  expiryDate: "",
  status: "Active",
  image: "",
};

export default function AddInventoryPage() {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      // Use inventory endpoint - creates items with isInventoryOnly = true
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/inventory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify((() => {
            const payload = {
            name: values.itemName,
            image: values.image, // Add image
            category: values.category,
            brand: values.brand,
            unitType: values.unitType,
            brand: values.brand,
            unitType: values.unitType,
            basePrice: values.itemType === 'supply' ? 0 : (parseFloat(values.sellingPrice) || 0),
            purchasePrice: values.purchasePrice ? parseFloat(values.purchasePrice) : 0,
            size: values.size,
            isActive: values.status === "Active",
            isServiceSupply: values.itemType === 'supply',
            expiryDate: values.expiryDate || null,
            quantity: parseInt(values.stock),
            lowStockThreshold: values.minStockAlert
              ? parseInt(values.minStockAlert)
              : 10,
            };
            console.log('🚀 Sending payload:', payload);
            return payload;
          })()),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create inventory item");
      }

      router.push("/dashboard/inventory");
    } catch (err) {
      console.error(err);
      setStatus({ error: err.message || "Failed to add inventory item." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Inventory Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={initialValues}
          validationSchema={inventoryValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status, values, setFieldValue }) => (
            <Form className="space-y-4">
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">Item Image</label>
                <div className="h-48 rounded-xl overflow-hidden border border-gray-700 bg-gray-900 relative group">
                  <ImageUploader
                    value={values.image}
                    onChange={(url) => setFieldValue("image", url)}
                    folder={IMAGE_UPLOAD_FOLDERS.INVENTORY || IMAGE_UPLOAD_FOLDERS.PRODUCTS}
                    className="h-full w-full object-cover"
                  />
                   {!values.image && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none bg-gray-900/50 hover:bg-gray-900/40 transition-colors">
                      <ImageIcon size={48} className="mb-2 opacity-50" />
                      <span className="text-sm font-medium">Click to Upload Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-3">Item Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFieldValue('itemType', 'sale')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      values.itemType === 'sale'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Package size={24} />
                    <div className="text-left">
                      <div className="font-medium">Sale Item</div>
                      <div className="text-xs opacity-70">Items sold to customers</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldValue('itemType', 'supply')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      values.itemType === 'supply'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Sparkles size={24} />
                    <div className="text-left">
                      <div className="font-medium">Service Supply</div>
                      <div className="text-xs opacity-70">Free items (tissues, napkins)</div>
                    </div>
                  </button>
                </div>
              </div>

              <FormInput
                label="Item Name"
                name="itemName"
                type="text"
                placeholder="Enter item name"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Category"
                  name="category"
                  options={values.itemType === 'supply' ? SERVICE_SUPPLY_CATEGORIES : INVENTORY_CATEGORIES}
                />

                {values.itemType === 'sale' && (
                  <FormInput
                    label="Brand (Optional)"
                    name="brand"
                    type="text"
                    placeholder="e.g. Coca Cola"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Unit Type"
                  name="unitType"
                  options={values.itemType === 'supply' ? SERVICE_SUPPLY_UNITS : UNIT_TYPES}
                />

                {values.itemType === 'sale' && (
                  <FormSelect
                    label="Size / Variant"
                    name="size"
                    options={SIZE_OPTIONS}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {values.itemType === 'sale' && (
                  <FormInput
                    label="Selling Price"
                    name="sellingPrice"
                    type="number"
                    placeholder="e.g., 80"
                  />
                )}
                <FormInput
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  placeholder="e.g., 50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Opening Stock"
                  name="stock"
                  type="number"
                  placeholder="Enter stock quantity"
                />

                <FormInput
                  label="Minimum Stock Alert"
                  name="minStockAlert"
                  type="number"
                  placeholder="e.g., 10"
                />
              </div>

              <FormInput
                label="Expiry Date (Optional)"
                name="expiryDate"
                type="date"
              />

              <FormSelect
                label="Status"
                name="status"
                options={STATUS_OPTIONS}
              />

              {status?.error && (
                <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-lg">
                  {status.error}
                </p>
              )}

              <div className="flex space-x-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Item"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/dashboard/inventory")}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
