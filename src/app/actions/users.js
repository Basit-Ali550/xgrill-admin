"use server";

import axiosInstance, { apiCall } from "@/lib/api-client";

export async function getUsersAction(search = "") {
  return apiCall(() => axiosInstance.get(`/api/v1/users?search=${search}`));
}

// Search customers (role=USER only) for POS — sorted by order count (regulars first)
export async function getCustomersAction(search = "") {
  const q = encodeURIComponent(search || "");
  return apiCall(() => axiosInstance.get(`/api/v1/users/customers?search=${q}`));
}
