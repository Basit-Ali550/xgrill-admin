"use client";
import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImageAction } from "@/app/actions/upload";

/**
 * Reusable Image Uploader Component
 * Uploads images to Cloudinary and returns the URL
 */
export default function ImageUploader({
  value = "",
  onChange,
  folder = "grill-x/products",
  className = "",
  placeholder = "Click to upload or drag and drop",
  accept = "image/*",
  maxSize = 10, // MB
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadImageAction(formData, folder);

      if (result.success) {
        onChange(result.data.url);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload area */}
      {!value ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 aspect-video
            flex flex-col items-center justify-center gap-2
            ${
              dragActive
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-600 hover:border-gray-500 bg-gray-900/50"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <span className="text-sm text-gray-400">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-500" />
              <span className="text-sm text-gray-400 text-center px-4">
                {placeholder}
              </span>
              <span className="text-xs text-gray-600">Max {maxSize}MB</span>
            </>
          )}
        </div>
      ) : (
        /* Preview with remove button */
        <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 
                       rounded-full text-white transition-colors shadow-lg"
          >
            <X size={16} />
          </button>

          {/* Replace button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-gray-900/80 hover:bg-gray-800 
                       rounded-lg text-white text-xs transition-colors shadow-lg flex items-center gap-1.5"
          >
            <ImageIcon size={14} />
            Replace
          </button>
        </div>
      )}

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
