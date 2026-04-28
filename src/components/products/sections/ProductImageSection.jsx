"use client";
import React from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { IMAGE_UPLOAD_FOLDERS } from "@/constants";

/**
 * Product image upload section
 */
export default function ProductImageSection({ image, setFieldValue }) {
  return (
    <ImageUploader
      value={image}
      onChange={(url) => setFieldValue("image", url)}
      folder={IMAGE_UPLOAD_FOLDERS.PRODUCTS}
      className="h-48 w-full rounded-xl"
      placeholder="Click to upload product image (800x800 recommended)"
    />
  );
}
