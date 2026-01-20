import * as Yup from "yup";

export const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Product name is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  category: Yup.string()
    .required("Category is required"),
  image: Yup.string()
    .url("Must be a valid URL")
    .nullable(),
  initialStock: Yup.number()
    .typeError("Stock must be a number")
    .integer("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .required("Initial stock is required"),
  lowStockThreshold: Yup.number()
    .typeError("Threshold must be a number")
    .integer("Threshold must be an integer")
    .min(0, "Threshold cannot be negative")
    .required("Low stock threshold is required"),
  ingredients: Yup.array()
    .of(Yup.string().required("Ingredient name is required"))
    .min(1, "At least one ingredient is required"),
});
