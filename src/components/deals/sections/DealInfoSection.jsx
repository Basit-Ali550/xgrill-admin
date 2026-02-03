"use client";
import React from "react";
import { Tag } from "lucide-react";
import { FormInput, FormTextarea } from "@/components/ui/form-components";
import ImageUploader from "@/components/ui/ImageUploader";

/**
 * Deal information section - image, name, and description
 */
export default function DealInfoSection({ values, setFieldValue }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Tag size={18} className="text-orange-500" />
        Deal Information
      </h3>
      <ImageUploader
        value={values.image}
        onChange={(url) => setFieldValue("image", url)}
        folder="grill-x/deals"
        placeholder="Upload Deal Cover Image"
        className="h-40"
      />
      <FormInput label="Deal Name" name="name" placeholder="SuperSaver Combo" />
      <FormTextarea
        label="Short Description"
        name="description"
        placeholder="A tasty mix of..."
        rows={2}
      />
    </div>
  );
}
