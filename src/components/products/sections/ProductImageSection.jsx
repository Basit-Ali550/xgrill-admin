"use client";
import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";
import { IMAGE_UPLOAD_FOLDERS } from "@/constants";

/**
 * Product image upload section with placeholder
 */
export default function ProductImageSection({ image, setFieldValue }) {
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-700 bg-gray-900 group relative">
      <ImageUploader
        value={image}
        onChange={(url) => setFieldValue("image", url)}
        folder={IMAGE_UPLOAD_FOLDERS.PRODUCTS}
        className="h-full w-full object-cover"
      />
      {!image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none bg-gray-900/50 hover:bg-gray-900/40 transition-colors">
          <ImageIcon size={48} className="mb-2 opacity-50" />
          <span className="text-sm font-medium">
            Click to Upload Product Image
          </span>
          <span className="text-xs text-gray-600 mt-1">
            Recommended size: 800x800px
          </span>
        </div>
      )}
    </div>
  );
}
