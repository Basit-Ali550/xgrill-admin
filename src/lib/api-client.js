import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.status === 204) return { success: true };
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const cookieStore = await cookies();
    }
    return Promise.reject(error);
  }
);

export async function apiCall(requestFn) {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      redirect("/login");
    }

    console.error("API Call Error:", error.response?.data || error.message);

    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      "An unexpected error occurred.";

    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export default axiosInstance;
