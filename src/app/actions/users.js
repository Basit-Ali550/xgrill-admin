"use server";

import axiosInstance, { apiCall } from "@/lib/api-client";

export async function getUsersAction(search = "") {
  return apiCall(() => axiosInstance.get(`/api/v1/users?search=${search}`));
}
