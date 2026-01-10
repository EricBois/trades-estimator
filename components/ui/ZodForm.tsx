"use client";

import { useEffect, PropsWithChildren } from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  SubmitHandler,
  Controller,
  FieldValues,
  Path,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ZodForm - Enhanced form wrapper for wizard steps
export function ZodForm<T extends FieldValues>({
  children,
  schema,
  defaultValues,
  onSubmit = () => undefined,
  mode = "onBlur",
  resetOnDefaultValueChange = false,
  className,
  id,
}: PropsWithChildren<{
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit?: SubmitHandler<T>;
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";
  resetOnDefaultValueChange?: boolean;
  className?: string;
  id?: string;
}>) {
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    mode,
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  // Reset form when defaults change (useful for edit mode)
  useEffect(() => {
    if (resetOnDefaultValueChange && defaultValues) {
      reset(defaultValues as T);
    }
  }, [resetOnDefaultValueChange, defaultValues, reset]);

  // Log form errors in development
  useEffect(() => {
    if (Object.keys(methods.formState.errors).length > 0) {
      console.warn("Form errors:", methods.formState.errors);
    }
  }, [methods.formState.errors]);

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        autoComplete="off"
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
        className={className}
      >
        {children}
      </form>
    </FormProvider>
  );
}

// Hook to access form state and methods from wizard steps
export function useZodForm<T extends FieldValues>() {
  return useFormContext<T>();
}

// Text Input Controller for ZodForm
export function ZodInput<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  className,
  required,
}: {
  name: Path<T>;
  label: string;
  type?: "text" | "email" | "tel" | "number";
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            value={field.value ?? ""}
            onChange={(e) => {
              if (type === "number") {
                const value = e.target.value;
                if (value === "" || value === null) {
                  field.onChange(null);
                } else {
                  const parsed = parseFloat(value);
                  field.onChange(isNaN(parsed) ? null : parsed);
                }
              } else {
                field.onChange(e.target.value);
              }
            }}
            className={cn(
              "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 transition-shadow",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-300" : "border-gray-300"
            )}
          />
        )}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Textarea Controller for ZodForm
export function ZodTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 3,
  className,
  required,
}: {
  name: Path<T>;
  label: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            value={field.value ?? ""}
            className={cn(
              "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 transition-shadow resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-300" : "border-gray-300"
            )}
          />
        )}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Select Controller for ZodForm
export function ZodSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  className,
  required,
}: {
  name: Path<T>;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            {...field}
            id={name}
            value={field.value ?? ""}
            className={cn(
              "block w-full px-4 py-3 border rounded-lg shadow-sm transition-shadow bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error ? "border-red-300" : "border-gray-300"
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
