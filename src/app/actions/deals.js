"use server";
import axiosInstance, { apiCall } from "@/lib/api-client";

export async function getDealsAction() {
  return apiCall(() => axiosInstance.get("/api/v1/deals"));
}

export async function getDealAction(id) {
  return apiCall(() => axiosInstance.get(`/api/v1/deals/${id}`));
}

export async function createDealAction(dealData) {
  const result = await apiCall(() => axiosInstance.post("/api/v1/deals", dealData));
  return result;
}

export async function updateDealAction(id, dealData) {
  return apiCall(() => axiosInstance.put(`/api/v1/deals/${id}`, dealData));
}

export async function deleteDealAction(id) {
  return apiCall(() => axiosInstance.delete(`/api/v1/deals/${id}`));
}
