"use client";

import { useWizard } from "react-use-wizard";
import { ArrowLeft, X, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WizardNavigation() {
  const { previousStep, isFirstStep } = useWizard();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-4 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Back button or Close */}
        {isFirstStep ? (
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5",
              "text-gray-600 hover:text-gray-900",
              "bg-gray-100 hover:bg-gray-200",
              "rounded-xl font-medium text-sm",
              "transition-all active:scale-[0.98]"
            )}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        ) : (
          <button
            onClick={previousStep}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5",
              "text-gray-600 hover:text-gray-900",
              "bg-gray-100 hover:bg-gray-200",
              "rounded-xl font-medium text-sm",
              "transition-all active:scale-[0.98]"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {/* Close button on first step, empty on others */}
        {isFirstStep ? (
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5",
              "text-gray-500 hover:text-gray-700",
              "hover:bg-gray-100",
              "rounded-xl font-medium text-sm",
              "transition-all active:scale-[0.98]"
            )}
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
        ) : (
          <div /> // Spacer
        )}
      </div>
    </div>
  );
}
