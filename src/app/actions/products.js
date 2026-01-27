"use server";

import { revalidatePath } from "next/cache";
import axiosInstance, { apiCall } from "@/lib/api-client";

export async function getProductsAction() {
  return apiCall(async () => {
    return axiosInstance.get("/api/v1/products");
  });
}

export async function createProductAction(productData) {
  const result = await apiCall(async () => {
    return axiosInstance.post("/api/v1/products", productData);
  });

  if (result.success) {
    revalidatePath("/dashboard/products");
  }
  return result;
}

