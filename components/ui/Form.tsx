"use client";

import type { ReactNode } from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  FieldValues,
  DefaultValues,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Form Root
interface FormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: DefaultValues<T>;
  children: ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
}: FormProps<T>) {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<T>,
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

// Form Input
interface FormInputProps {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export function FormInput({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error ? "border-red-300" : "border-gray-300"
        )}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Form Select
interface FormSelectProps {
  name: string;
  label: string;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
  className?: string;
}

export function FormSelect({
  name,
  label,
  placeholder,
  options,
  className,
}: FormSelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <select
        {...register(name)}
        id={name}
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
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Form Error Alert
interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

// Form Submit Button
interface FormSubmitProps {
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export function FormSubmit({
  children,
  loadingText = "Submitting...",
  className,
}: FormSubmitProps) {
  const { formState } = useFormContext();

  return (
    <button
      type="submit"
      disabled={formState.isSubmitting}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-3 px-4",
        "border border-transparent rounded-lg shadow-sm",
        "text-base font-medium text-white bg-blue-600",
        "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className
      )}
    >
      {formState.isSubmitting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
