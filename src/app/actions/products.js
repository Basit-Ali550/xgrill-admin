"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getProductsAction() {
  try {
    const res = await fetch(`${API_URL}/api/v1/products`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: error.message };
  }
}

export async function createProductAction(productData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.message || "Failed to create product" };
    }

    revalidatePath("/dashboard/products");
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

