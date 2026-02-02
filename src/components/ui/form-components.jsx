"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useField } from "formik";

const FormInput = ({ label, className, ...props }) => {
  const [field, meta] = useField(props);
  const errorText = meta.touched && meta.error ? meta.error : "";
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = props.type === "password";
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
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
      <div className="relative">
        <Input
          {...field}
          {...props}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
          className={cn(
            errorText && "border-red-400 focus:ring-red-400",
            isPassword && "pr-10",
            className,
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
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

const FormSelect = ({
  label,
  children, // Kept for backward compat but Select ignores it in favor of options
  className,
  options = [],
  placeholder = "Select option",
  ...props
}) => {
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
      <Select
        {...field}
        {...props}
        options={options}
        placeholder={placeholder}
        className={cn(
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

export { FormInput, FormTextarea, FormSelect };
