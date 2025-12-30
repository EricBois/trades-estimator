"use client";

import { useWizard } from "react-use-wizard";
import { Calculator, Grid3X3 } from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
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
];

export function HangingInputModeStep() {
  const { nextStep } = useWizard();
  const { inputMode, setInputMode, addRoom } = useHangingEstimate();

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
