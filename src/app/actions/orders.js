"use server";

import { revalidatePath } from "next/cache";
import axiosInstance, { apiCall } from "@/lib/api-client";

export async function getOrdersAction(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return apiCall(() => axiosInstance.get(`/api/v1/orders?${queryString}`));
}

export async function placeOrderAction(orderData) {
  const result = await apiCall(() => axiosInstance.post("/api/v1/orders", orderData));
  if (result.success) {
    revalidatePath("/dashboard/orders");
  }
  return result;
}

export async function addItemAction(orderId, itemData) {
  const result = await apiCall(() => axiosInstance.post(`/api/v1/orders/${orderId}/items`, itemData));
  if (result.success) {
    revalidatePath("/dashboard/orders");
  }
  return result;
}
