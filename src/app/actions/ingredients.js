"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Fetch all ingredients
export async function getIngredientsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/api/v1/ingredients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch ingredients error:", error);
    return { success: false, error: "Failed to fetch ingredients" };
  }
}

// Create ingredient
export async function createIngredientAction(ingredientData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/api/v1/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ingredientData),
    });
    const data = await res.json();
    
    if (data.success) {
      revalidatePath("/dashboard/ingredients");
    }
    return data;
  } catch (error) {
    console.error("Create ingredient error:", error);
    return { success: false, error: "Failed to create ingredient" };
  }
}

// Update ingredient
export async function updateIngredientAction(id, ingredientData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/api/v1/ingredients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ingredientData),
    });
    const data = await res.json();
    
    if (data.success) {
      revalidatePath("/dashboard/ingredients");
    }
    return data;
  } catch (error) {
    console.error("Update ingredient error:", error);
    return { success: false, error: "Failed to update ingredient" };
  }
}

// Delete ingredient
export async function deleteIngredientAction(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/api/v1/ingredients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    
    if (data.success) {
      revalidatePath("/dashboard/ingredients");
    }
    return data;
  } catch (error) {
    console.error("Delete ingredient error:", error);
    return { success: false, error: "Failed to delete ingredient" };
  }
}

// Adjust stock (add or subtract)
export async function adjustStockAction(id, adjustment, reason) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { success: false, error: "Unauthorized" };

  try {
    const res = await fetch(`${API_URL}/api/v1/ingredients/${id}/adjust`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adjustment, reason }),
    });
    const data = await res.json();
    
    if (data.success) {
      revalidatePath("/dashboard/ingredients");
    }
    return data;
  } catch (error) {
    console.error("Adjust stock error:", error);
    return { success: false, error: "Failed to adjust stock" };
  }
}
