import * as Yup from "yup";

export const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Product name is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  basePrice: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .notRequired(), // Optional because products with sizes might not need base price
  category: Yup.string()
    .required("Category is required"),
  image: Yup.string()
    .test("is-url-or-empty", "Must be a valid URL", (value) => {
      if (!value || value === "") return true; // Allow empty
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .nullable(),
  // Legacy ingredients array - optional
  ingredients: Yup.array()
    .of(Yup.string())
    .notRequired(),
  // Recipe data for ingredient linking
  recipeData: Yup.array()
    .of(
      Yup.object().shape({
        ingredientId: Yup.string(),
        quantityRequired: Yup.number().min(0, "Quantity must be positive"),
        unit: Yup.string(),
      })
    )
    .notRequired(),
  // Size variants
  variants: Yup.array()
    .of(
      Yup.object().shape({
        size: Yup.string(),
        price: Yup.number().min(0, "Price must be positive"),
        isDefault: Yup.boolean(),
      })
    )
    .notRequired(),
});
