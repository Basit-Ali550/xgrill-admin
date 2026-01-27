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
} from "@/constants";

// Yup validation schema
const inventoryValidationSchema = Yup.object({
  itemName: Yup.string()
    .required("Item name is required")
    .min(2, "Item name must be at least 2 characters"),
  category: Yup.string().required("Category is required"),
  brand: Yup.string(),
  unitType: Yup.string(),
  size: Yup.string(),
  sellingPrice: Yup.number()
    .required("Selling price is required")
    .positive("Selling price must be positive")
    .typeError("Selling price must be a number"),
  stock: Yup.number()
    .required("Stock quantity is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .typeError("Stock must be a number"),
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
  itemName: "",
  category: "",
  brand: "",
  unitType: "",
  size: "",
  sellingPrice: "",
  stock: "",
  minStockAlert: "",
  expiryDate: "",
  status: "Active",
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
          body: JSON.stringify({
            name: values.itemName,
            category: values.category,
            brand: values.brand,
            unitType: values.unitType,
            basePrice: parseFloat(values.sellingPrice) || 0,
            size: values.size,
            isActive: values.status === "Active",
            expiryDate: values.expiryDate || null,
            quantity: parseInt(values.stock),
            lowStockThreshold: values.minStockAlert
              ? parseInt(values.minStockAlert)
              : 10,
          }),
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
          {({ isSubmitting, status }) => (
            <Form className="space-y-4">
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
                  options={INVENTORY_CATEGORIES}
                />

                <FormInput
                  label="Brand (Optional)"
                  name="brand"
                  type="text"
                  placeholder="e.g. Coca Cola"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Unit Type"
                  name="unitType"
                  options={UNIT_TYPES}
                />

                <FormSelect
                  label="Size / Variant"
                  name="size"
                  options={SIZE_OPTIONS}
                />
              </div>

              <FormInput
                label="Selling Price"
                name="sellingPrice"
                type="number"
                placeholder="e.g., 80"
              />

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
