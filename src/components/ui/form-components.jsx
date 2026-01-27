"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useField } from "formik";

const FormInput = ({ label, className, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.touched && meta.error ? meta.error : "";

  return (
    <div className="space-y-1.5">
      {label && (
        <Label
          htmlFor={props.id || props.name}
          className={cn(errorText && "text-red-400")}
        >
          {label}
        </Label>
      )}
      <Input
        {...field}
        {...props}
        className={cn(
          errorText && "border-red-400 focus:ring-red-400",
          className,
        )}
      />
      {errorText && (
        <p className="text-[10px] text-red-400 font-normal animate-in slide-in-from-top-1">
          {errorText}
        </p>
      )}
    </div>
  );
};

const FormTextarea = ({ label, className, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.touched && meta.error ? meta.error : "";

  return (
    <div className="space-y-1">
      {label && (
        <Label
          htmlFor={props.id || props.name}
          className={cn(errorText && "text-red-300")}
        >
          {label}
        </Label>
      )}
      <textarea
        {...field}
        {...props}
        className={cn(
          "flex w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          errorText && "border-red-400 focus:ring-red-400",
          className,
        )}
      />
      {errorText && (
        <p className="text-[10px] text-red-400 font-medium animate-in slide-in-from-top-1">
          {errorText}
        </p>
      )}
    </div>
  );
};

const FormSelect = ({ label, children, className, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.touched && meta.error ? meta.error : "";

  return (
    <div className="space-y-1.5">
      {label && (
        <Label
          htmlFor={props.id || props.name}
          className={cn(errorText && "text-red-400")}
        >
          {label}
        </Label>
      )}
      <select
        {...field}
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-600 mt-1 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
          errorText && "border-red-400 focus:ring-red-400",
          className,
        )}
      >
        {children}
      </select>
      {errorText && (
        <p className="text-[10px] text-red-400 font-medium animate-in slide-in-from-top-1">
          {errorText}
        </p>
      )}
    </div>
  );
};

export { FormInput, FormTextarea, FormSelect };
