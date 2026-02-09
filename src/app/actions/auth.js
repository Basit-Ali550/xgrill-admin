"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axiosInstance, { apiCall } from "@/lib/api-client";

export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }
 try {
    const response = await axiosInstance.post("/api/v1/auth/login", { email, password });
    
    // Axios interceptor returns response.data directly
    const data = response;

    if (!data.success) {
      return { error: data.error || data.message || "Login failed" };
    }

    if (data.data.user.role !== "ADMIN" && data.data.user.role !== "CHEF") {
      return { error: "Access denied. Insufficient privileges." };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    
    return { success: true, data: data.data };
    
  } catch (error) {
    console.error("Login error:", error);
    const msg = error.response?.data?.message || "Something went wrong. Please try again.";
    return { error: msg };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

