"use server";

import { revalidatePath } from "next/cache";
import axiosInstance, { apiCall } from "@/lib/api-client";

// Fetch all ingredients
export async function getIngredientsAction() {
  return apiCall(() => axiosInstance.get("/api/v1/ingredients"));
}

// Create ingredient
export async function createIngredientAction(ingredientData) {
  const result = await apiCall(() => axiosInstance.post("/api/v1/ingredients", ingredientData));
  
  if (result.success) {
    revalidatePath("/dashboard/ingredients");
  }
  return result;
}

// Update ingredient
export async function updateIngredientAction(id, ingredientData) {
  const result = await apiCall(() => axiosInstance.put(`/api/v1/ingredients/${id}`, ingredientData));
  
  if (result.success) {
    revalidatePath("/dashboard/ingredients");
  }
  return result;
}

// Delete ingredient
export async function deleteIngredientAction(id) {
  const result = await apiCall(() => axiosInstance.delete(`/api/v1/ingredients/${id}`));
  
  if (result.success) {
    revalidatePath("/dashboard/ingredients");
  }
  return result;
}

// Adjust stock (add or subtract)
export async function adjustStockAction(id, adjustment, reason, newPrice) {
  const result = await apiCall(() => axiosInstance.patch(`/api/v1/ingredients/${id}/adjust`, { adjustment, reason, newPrice }));
  
  if (result.success) {
    revalidatePath("/dashboard/ingredients");
  }
  return result;
}
