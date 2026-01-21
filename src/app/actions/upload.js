"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Upload a single image to Cloudinary via backend
 * @param {FormData} formData - FormData containing an 'image' file field
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<Object>} - Upload result with URL
 */
export async function uploadImageAction(formData, folder = "grill-x/products") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  try {
    // Get the file from FormData
    const file = formData.get("image");
    
    if (!file || !(file instanceof File)) {
      return { success: false, error: "No image file provided." };
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const base64Image = `data:${mimeType};base64,${base64}`;

    // Use the base64 endpoint instead of multipart
    const res = await fetch(`${API_URL}/api/v1/upload/base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: base64Image, folder }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.message || "Failed to upload image" };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

/**
 * Upload multiple images to Cloudinary via backend
 * @param {FormData} formData - FormData containing 'images' file field (multiple)
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<Object>} - Upload results with URLs
 */
export async function uploadMultipleImagesAction(formData, folder = "grill-x/products") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/upload/images?folder=${folder}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.message || "Failed to upload images" };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteImageAction(publicId) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/upload`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, error: data.message || "Failed to delete image" };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Network error. Please try again." };
  }
}
