"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Login failed" };
    }

    if (data.data.user.role !== "ADMIN") {
      return { error: "Access denied. Admin only." };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    // Store user data in a non-httpOnly cookie if needed for client-side display, 
    // or just rely on server-side rendering. For now, let's keep it minimal.
    // We can also store a simple flag or the user object (serialized) but careful with sensitive info.
    // Let's store basic user info for the client context to hydrate if needed, 
    // or we can just skip it and fetch user profile on load.
    // Given the "AuthContext" exists, let's set a user cookie too but non-httpOnly? 
    // Actually, let's just use the token in the cookie for server actions. 
    // Client side can fetch "/me" if needed.
    
    // However, to keep AuthContext happy for now without breaking everything:
    // We'll let the client handling the success redirect also set the localStorage if it wants to maintain compatibility,
    // OR we fully commit to cookies.
    // Since the prompt says "max server side action", we should rely on cookies.
    
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Something went wrong. Please try again." };
  }
  
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
