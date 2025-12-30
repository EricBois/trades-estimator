"use client";

import { Wizard } from "react-use-wizard";
import { WizardProgress } from "../../WizardProgress";
import { WizardNavigation } from "../../WizardNavigation";
import {
  HangingEstimateProvider,
  useHangingEstimate,
} from "./HangingEstimateContext";
import { HangingInputModeStep } from "./HangingInputModeStep";
import { HangingRoomStep } from "./HangingRoomStep";
import { HangingSheetTypeStep } from "./HangingSheetTypeStep";
import { HangingDirectEntryStep } from "./HangingDirectEntryStep";
import { HangingAddonsStep } from "./HangingAddonsStep";
import { HangingComplexityStep } from "./HangingComplexityStep";
import { HangingPreview } from "./HangingPreview";
import { HangingSendEstimate } from "./HangingSendEstimate";

// Wrapper component for consistent step layout
function StepWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-6 pb-28">{children}</div>
    </div>
  );
}

// Inner wizard that can access context
function HangingWizardInner() {
  const { inputMode } = useHangingEstimate();

  // Steps vary based on input mode:
  // Calculator: InputMode -> Rooms -> SheetType -> Addons -> Complexity -> Preview -> Send
  // Direct:     InputMode -> DirectEntry -> Addons -> Complexity -> Preview -> Send

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Wizard
        header={<WizardProgress />}
        footer={<WizardNavigation />}
        wrapper={<StepWrapper />}
      >
        {/* Step 0: Input Mode Selection */}
        <HangingInputModeStep />

        {/* Steps 1-2 vary by mode */}
        {inputMode === "calculator" && <HangingRoomStep />}
        {inputMode === "calculator" && <HangingSheetTypeStep />}
        {inputMode === "direct" && <HangingDirectEntryStep />}
        {/* Common steps */}
        <HangingAddonsStep />
        <HangingComplexityStep />
        <HangingPreview />
        <HangingSendEstimate />
      </Wizard>
    </div>
  );
}

export function HangingEstimateWizard() {
  return (
    <HangingEstimateProvider>
      <HangingWizardInner />
    </HangingEstimateProvider>
  );
}
