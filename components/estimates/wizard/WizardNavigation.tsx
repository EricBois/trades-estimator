"use client";

import { useWizard } from "react-use-wizard";
import { ArrowLeft, Home, ChevronRight, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWizardFooter } from "./WizardFooterContext";

export function WizardNavigation() {
  const { previousStep, isFirstStep } = useWizard();
  const { config } = useWizardFooter();

  const Icon = config?.icon === "send" ? Send : ChevronRight;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-safe z-40">
      <div className="max-w-2xl mx-auto">
        {/* Navigation buttons - Back on left, Continue on right */}
        <div className="flex items-center justify-between gap-3">
          {/* Back button or Dashboard */}
          {isFirstStep ? (
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-3",
                "text-gray-600 hover:text-gray-900",
                "bg-gray-100 hover:bg-gray-200",
                "rounded-xl font-medium text-sm",
                "transition-all active:scale-[0.98]"
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <button
              onClick={previousStep}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-4 py-3",
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

          {/* Continue button on far right */}
          {config && (
            <button
              onClick={config.onContinue}
              disabled={config.disabled || config.isLoading}
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-6 py-3",
                "bg-blue-600 text-white rounded-xl",
                "hover:bg-blue-700 active:scale-[0.98]",
                "transition-all font-medium text-base",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {config.isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {config.loadingText || "Loading..."}
                </>
              ) : (
                <>
                  {config.continueText || "Continue"}
                  <Icon className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
