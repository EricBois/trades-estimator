"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function WizardStepper({
  steps,
  currentStep,
  className,
}: WizardStepperProps) {
  return (
    <>
      {/* Desktop: Vertical sidebar stepper */}
      <div
        className={cn(
          "hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-6",
          className
        )}
      >
        <div className="space-y-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={index} className="flex items-start">
                {/* Circle and line container */}
                <div className="flex flex-col items-center mr-4">
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                      isCompleted && "bg-blue-600 text-white",
                      isCurrent &&
                        "bg-white border-2 border-blue-600 text-blue-600 ring-4 ring-blue-100",
                      isPending &&
                        "bg-gray-100 text-gray-400 border-2 border-gray-200"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Connecting line (not on last item) */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-12 transition-colors duration-300",
                        index < currentStep ? "bg-blue-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="pt-2">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isCompleted && "text-blue-600",
                      isCurrent && "text-gray-900",
                      isPending && "text-gray-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet: Horizontal stepper in header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {/* Step counter and label */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {steps[currentStep]?.label}
            </span>
          </div>

          {/* Horizontal progress circles */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div key={index} className="flex items-center">
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                      isCompleted && "bg-blue-600 text-white",
                      isCurrent &&
                        "bg-white border-2 border-blue-600 text-blue-600 shadow-sm",
                      isPending && "bg-gray-100 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {/* Connecting line (not on last item) */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-4 sm:w-6 h-0.5 mx-1 transition-colors duration-300",
                        index < currentStep ? "bg-blue-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
