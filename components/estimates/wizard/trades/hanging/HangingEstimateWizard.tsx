"use client";

import { Wizard } from "react-use-wizard";
import { WizardNavigation } from "../../WizardNavigation";
import { createWizardWrapper, WizardOuterLayout } from "../../WizardLayout";
import {
  HangingEstimateProvider,
  useHangingEstimate,
} from "./HangingEstimateContext";
import { HangingInputModeStep } from "./HangingInputModeStep";
import { HangingRoomStep } from "./HangingRoomStep";
import { HangingSheetTypeStep } from "./HangingSheetTypeStep";
import { HangingDirectEntryStep } from "./HangingDirectEntryStep";
import { HangingLaborOnlyStep } from "./HangingLaborOnlyStep";
import { HangingAddonsStep } from "./HangingAddonsStep";
import { HangingComplexityStep } from "./HangingComplexityStep";
import { HangingPreview } from "./HangingPreview";
import { HangingSendEstimate } from "./HangingSendEstimate";

// Step configuration for calculator mode (7 steps)
const CALCULATOR_STEPS = [
  { label: "Input Mode" },
  { label: "Rooms" },
  { label: "Sheet Type" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Step configuration for direct mode (6 steps)
const DIRECT_STEPS = [
  { label: "Input Mode" },
  { label: "Measurements" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Step configuration for labor-only mode (5 steps)
const LABOR_ONLY_STEPS = [
  { label: "Input Mode" },
  { label: "Square Footage" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Create wrapper components outside of render
const CalculatorWizardWrapper = createWizardWrapper(CALCULATOR_STEPS);
const DirectWizardWrapper = createWizardWrapper(DIRECT_STEPS);
const LaborOnlyWizardWrapper = createWizardWrapper(LABOR_ONLY_STEPS);

// Inner wizard that can access context
function HangingWizardInner() {
  const { inputMode } = useHangingEstimate();

  // Steps vary based on input mode:
  // Calculator:  InputMode -> Rooms -> SheetType -> Addons -> Complexity -> Preview -> Send
  // Direct:      InputMode -> DirectEntry -> Addons -> Complexity -> Preview -> Send
  // Labor Only:  InputMode -> LaborOnly (sqft) -> Addons -> Complexity -> Preview -> Send

  const WizardWrapper =
    inputMode === "calculator"
      ? CalculatorWizardWrapper
      : inputMode === "labor_only"
      ? LaborOnlyWizardWrapper
      : DirectWizardWrapper;

  return (
    <WizardOuterLayout>
      <Wizard footer={<WizardNavigation />} wrapper={<WizardWrapper />}>
        {/* Step 0: Input Mode Selection */}
        <HangingInputModeStep />

        {/* Steps 1-2 vary by mode */}
        {inputMode === "calculator" && <HangingRoomStep />}
        {inputMode === "calculator" && <HangingSheetTypeStep />}
        {inputMode === "direct" && <HangingDirectEntryStep />}
        {inputMode === "labor_only" && <HangingLaborOnlyStep />}
        {/* Common steps */}
        <HangingAddonsStep />
        <HangingComplexityStep />
        <HangingPreview />
        <HangingSendEstimate />
      </Wizard>
    </WizardOuterLayout>
  );
}

export function HangingEstimateWizard() {
  return (
    <HangingEstimateProvider>
      <HangingWizardInner />
    </HangingEstimateProvider>
  );
}
