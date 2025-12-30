"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function WizardButton({
  onClick,
  disabled = false,
  loading = false,
  icon: Icon = ChevronRight,
  children,
  variant = "primary",
  className,
}: WizardButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full flex items-center justify-center gap-2",
        "min-h-15 px-6",
        "rounded-xl font-medium text-lg",
        "transition-all active:scale-[0.98]",
        variant === "primary" &&
          !isDisabled &&
          "bg-blue-600 text-white hover:bg-blue-700",
        variant === "primary" &&
          isDisabled &&
          "bg-gray-200 text-gray-400 cursor-not-allowed",
        variant === "secondary" &&
          !isDisabled &&
          "bg-gray-100 text-gray-700 hover:bg-gray-200",
        variant === "secondary" &&
          isDisabled &&
          "bg-gray-100 text-gray-300 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {children}
          <Icon className="w-5 h-5" />
        </>
      )}
    </button>
  );
}
