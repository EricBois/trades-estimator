"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Calculator, Grid3X3, Hammer, FileText } from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { HangingInputMode } from "@/lib/trades/drywallHanging/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { OptionCard } from "@/components/ui/OptionCard";

const INPUT_MODES = [
  {
    value: "calculator" as HangingInputMode,
    label: "Calculate from Room",
    description: "Enter room dimensions and we'll calculate sheets needed",
    icon: Calculator,
  },
  {
    value: "direct" as HangingInputMode,
    label: "Enter Sheets Directly",
    description: "Manually specify sheet types and quantities",
    icon: Grid3X3,
  },
  {
    value: "labor_only" as HangingInputMode,
    label: "Labor Only",
    description: "Client supplies materials - charge by square footage",
    icon: Hammer,
  },
];

interface HangingInputModeStepProps {
  estimateName?: string;
  onEstimateNameChange?: (name: string) => void;
}

export function HangingInputModeStep({
  estimateName = "",
  onEstimateNameChange,
}: HangingInputModeStepProps) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { inputMode, setInputMode, addRoom } = useHangingEstimate();

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: !inputMode,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, inputMode]);

  const handleSelect = (mode: HangingInputMode) => {
    setInputMode(mode);

    // If calculator mode, add a default room
    if (mode === "calculator") {
      addRoom();
    }

    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Estimate Name Input */}
      {onEstimateNameChange && (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Estimate Name (optional)
          </label>
          <input
            type="text"
            value={estimateName}
            onChange={(e) => onEstimateNameChange(e.target.value)}
            placeholder="e.g., Smith Kitchen Remodel"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1.5 text-sm text-gray-500">
            Give your estimate a name to find it later
          </p>
        </div>
      )}

      <StepHeader
        title="How would you like to estimate?"
        description="Choose your preferred method"
      />

      <div className="space-y-4">
        {INPUT_MODES.map((mode) => (
          <OptionCard
            key={mode.value}
            icon={mode.icon}
            label={mode.label}
            description={mode.description}
            isSelected={inputMode === mode.value}
            onClick={() => handleSelect(mode.value)}
          />
        ))}
      </div>
    </div>
  );
}
