"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/components/ui/form-components";
import ImageUploader from "@/components/ui/ImageUploader";
import { staffSchema, editStaffSchema } from "@/lib/validations";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Lock,
  Phone,
  Bike,
  Coffee,
  Utensils,
  Monitor,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Briefcase,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_CONFIG = {
  DELIVERY_BOY: { label: "Delivery Boy", icon: Bike },
  WAITER: { label: "Waiter", icon: Coffee },
  CHEF: { label: "Chef", icon: Utensils },
  RECEPTIONIST: { label: "Receptionist", icon: Monitor },
  ADMIN: { label: "Admin", icon: ShieldCheck },
  USER: { label: "User", icon: Smile },
};

const roleOptions = Object.entries(ROLE_CONFIG).map(([key, config]) => ({
  value: key,
  label: config.label,
}));

const defaultInitialValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "DELIVERY_BOY",
  profileImage: "",
  idCardImage: "",
};

export default function AddStaffModal({
  isOpen,
  onClose,
  onAdd,
  initialData,
  isEditMode,
}) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUploadStatus = (status) => {
    setIsUploadingImage(status);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let res;
      if (isEditMode && initialData?.id) {
        // Update Mode
        res = await api.put(`/api/v1/users/${initialData.id}`, values);
      } else {
        // Create Mode
        res = await api.post("/api/v1/auth/register", values);
      }

      if (res.success) {
        if (onAdd) onAdd(res.data.user || res.data); // Handle structure variation if any
        resetForm();
        onClose();
      } else {
        alert(res.error || "Failed");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formInitialValues = initialData
    ? {
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", // Don't prefill password
        phone: initialData.phone || "",
        role: initialData.role || "DELIVERY_BOY",
        profileImage: initialData.profileImage || "",
        idCardImage: initialData.idCardImage || "",
      }
    : defaultInitialValues;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Member" : "Add New Staff Member"}
      className="max-w-3xl w-full p-0 overflow-hidden"
      noPadding={true}
    >
      <Formik
        initialValues={formInitialValues}
        enableReinitialize={true}
        validationSchema={isEditMode ? editStaffSchema : staffSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => {
          return (
            <Form className="flex flex-col flex-1 min-h-0 bg-gray-950">
              <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Role Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-500/10 rounded-md">
                        <Briefcase size={16} className="text-orange-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        Assign Role
                      </span>
                    </div>
                    <FormSelect
                      name="role"
                      label="Select Role"
                      placeholder="Choose a role..."
                      options={roleOptions}
                      className="bg-gray-900 border-gray-800 focus:border-orange-500"
                    />
                  </div>

                  <div className="h-px bg-gray-800" />

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      name="name"
                      label="Full Name"
                      placeholder="Jane Doe"
                      icon={User}
                    />
                    <FormInput
                      name="phone"
                      label="Phone"
                      placeholder="+92 300..."
                      icon={Phone}
                    />
                  </div>

                  {/* Credentials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      name="email"
                      label="Email"
                      type="email"
                      placeholder="jane@grillx.com"
                      icon={Mail}
                    />
                    <div className="relative">
                      <FormInput
                        name="password"
                        label={
                          isEditMode ? "Change Password (Optional)" : "Password"
                        }
                        type="password"
                        placeholder={
                          isEditMode ? "Leave empty to keep same" : "••••••"
                        }
                        icon={Lock}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gray-800" />

                  {/* Documents Section */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors flex items-start gap-4">
                      {/* Left: Uploader */}
                      <div className="shrink-0 w-32 h-32">
                        <ImageUploader
                          value={values.profileImage}
                          onChange={(url) => setFieldValue("profileImage", url)}
                          folder="grill-x/staff-profiles"
                          className="w-full h-full"
                          onUploadStatusChange={handleUploadStatus}
                        />
                      </div>

                      {/* Right: Info */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 bg-orange-500/10 rounded-md">
                            <User size={16} className="text-orange-500" />
                          </div>
                          <h4 className="text-sm font-medium text-white">
                            Profile Photo
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Recommended size: 500x500px. <br />
                          Visible on staff cards and order management.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors flex items-start gap-4">
                      {/* Left: Uploader */}
                      <div className="shrink-0 w-48 h-32">
                        <ImageUploader
                          value={values.idCardImage}
                          onChange={(url) => setFieldValue("idCardImage", url)}
                          folder="grill-x/staff-ids"
                          className="w-full h-full"
                          onUploadStatusChange={handleUploadStatus}
                        />
                      </div>

                      {/* Right: Info */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 bg-blue-500/10 rounded-md">
                            <CreditCard size={16} className="text-blue-500" />
                          </div>
                          <h4 className="text-sm font-medium text-white">
                            ID Card / Document
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Upload CNIC, Driving License, or other official ID.{" "}
                          <br />
                          Kept private for internal records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex justify-end gap-3 mt-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20"
                >
                  {isUploadingImage
                    ? "Uploading..."
                    : isSubmitting
                      ? isEditMode
                        ? "Saving..."
                        : "Creating..."
                      : isEditMode
                        ? "Save Changes"
                        : "Create Member"}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}
