"use client";

import { useWizard } from "react-use-wizard";
import { Navbar } from "@/components/layout/Navbar";
import { WizardStepper } from "@/components/ui/WizardStepper";

interface Step {
  label: string;
}

// Factory function to create a wrapper component with steps
export function createWizardWrapper(steps: Step[]) {
  return function WizardWrapper({ children }: { children?: React.ReactNode }) {
    const { activeStep } = useWizard();

    return (
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile horizontal stepper - shown at top on mobile */}
        <div className="lg:hidden">
          <WizardStepper steps={steps} currentStep={activeStep} />
        </div>

        {/* Desktop sidebar stepper - shown on left on desktop */}
        <div className="hidden lg:block">
          <WizardStepper steps={steps} currentStep={activeStep} />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Step content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto py-6 px-4 pb-28">{children}</div>
          </div>
        </div>
      </div>
    );
  };
}

// Outer layout that wraps the entire wizard (navbar + main area)
interface WizardOuterLayoutProps {
  children: React.ReactNode;
}

export function WizardOuterLayout({ children }: WizardOuterLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar showNavigation={false} />

      {/* Main content area - the Wizard goes here */}
      {children}
    </div>
  );
}
