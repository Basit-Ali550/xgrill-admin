"use server";

import axiosInstance, { apiCall } from "@/lib/api-client";

/**
 * Upload a single image to Cloudinary via backend
 * @param {FormData} formData - FormData containing an 'image' file field
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<Object>} - Upload result with URL
 */
export async function uploadImageAction(formData, folder = "grill-x/products") {
  // Pre-processing logic remains the same (file check, base64 conversion)
  // because we are using the base64 endpoint for single image upload.
  try {
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

    return apiCall(() => axiosInstance.post("/api/v1/upload/base64", { image: base64Image, folder }));
  } catch (error) {
    console.error("Upload setup error:", error);
    return { success: false, error: "Upload preparation failed." };
  }
}

export async function uploadMultipleImagesAction(formData, folder = "grill-x/products") {
  // For multiple images, we send FormData directly.
  // apiCall wrapper works fine.
  // Query param handling needs to be put in URL.
  return apiCall(() => axiosInstance.post(`/api/v1/upload/images?folder=${folder}`, formData));
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteImageAction(publicId) {
  // Axios delete with body requires `data` property in config
  return apiCall(() => axiosInstance.delete("/api/v1/upload", { 
    data: { publicId } 
  }));
}
