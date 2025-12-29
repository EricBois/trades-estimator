"use client";

import { useWizard } from "react-use-wizard";
import Link from "next/link";
import { X } from "lucide-react";

const STEP_LABELS = [
  "Trade",
  "Template",
  "Details",
  "Complexity",
  "Preview",
  "Send",
];

export function WizardProgress() {
  const { activeStep } = useWizard();

  return (
    <div className="sticky top-0 z-10 px-4 py-4 bg-white border-b border-gray-200">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link
          href="/dashboard"
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          {STEP_LABELS[activeStep] || "New Estimate"}
        </h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
    </div>
  );
}
