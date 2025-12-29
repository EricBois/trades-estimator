"use client";

import { useWizard } from "react-use-wizard";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WizardNavigation() {
  const { previousStep, isFirstStep, activeStep, stepCount } = useWizard();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-safe z-10">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* Back button or Close */}
        {isFirstStep ? (
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-3 py-2 -ml-3",
              "text-gray-500 hover:text-gray-700",
              "transition-colors rounded-lg"
            )}
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Close</span>
          </Link>
        ) : (
          <button
            onClick={previousStep}
            className={cn(
              "flex items-center gap-2 px-3 py-2 -ml-3",
              "text-gray-600 hover:text-gray-900",
              "transition-colors rounded-lg"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: stepCount }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === activeStep
                  ? "bg-blue-600"
                  : index < activeStep
                    ? "bg-blue-300"
                    : "bg-gray-300"
              )}
            />
          ))}
        </div>

        {/* Step label */}
        <div className="text-sm text-gray-500 min-w-[60px] text-right">
          {activeStep + 1} of {stepCount}
        </div>
      </div>
    </div>
  );
}
