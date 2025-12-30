"use client";

import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Settings Text Input - for text fields like company name
interface SettingsTextInputProps {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  className?: string;
}

export function SettingsTextInput({
  name,
  label,
  placeholder,
  hint,
  className,
}: SettingsTextInputProps) {
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
        type="text"
        placeholder={placeholder}
        className={cn(
          "block w-full px-4 py-3 border rounded-lg shadow-sm transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error ? "border-red-300" : "border-gray-300"
        )}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message as string}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

// Settings Number Input - for rate/price fields with unit suffix and hint
interface SettingsInputProps {
  name: string;
  label: string;
  unit?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

export function SettingsInput({
  name,
  label,
  unit,
  hint,
  min = 0,
  max,
  step = 0.01,
  placeholder,
  className,
}: SettingsInputProps) {
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
        {unit && <span className="text-gray-400 font-normal ml-1">{unit}</span>}
      </label>
      <input
        {...register(name, { valueAsNumber: true })}
        id={name}
        type="number"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={cn(
          "block w-full px-4 py-3 border rounded-lg shadow-sm transition-shadow",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error ? "border-red-300" : "border-gray-300"
        )}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message as string}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

// Settings Select - for dropdown fields with hint
interface SettingsSelectProps {
  name: string;
  label: string;
  options: Array<{ value: number; label: string }>;
  hint?: string;
  className?: string;
}

export function SettingsSelect({
  name,
  label,
  options,
  hint,
  className,
}: SettingsSelectProps) {
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
        {...register(name, { valueAsNumber: true })}
        id={name}
        className={cn(
          "block w-full px-4 py-3 border rounded-lg shadow-sm transition-shadow bg-white",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error ? "border-red-300" : "border-gray-300"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error.message as string}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}
