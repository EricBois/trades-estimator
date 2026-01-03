"use client";

import { Gauge } from "lucide-react";
import { SettingsInput } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";

interface ComplexitySectionProps {
  prefix: string;
  title?: string;
  description?: string;
  defaults?: {
    simple: number;
    standard: number;
    complex: number;
  };
}

const DEFAULT_COMPLEXITY = {
  simple: 0.85,
  standard: 1.0,
  complex: 1.3,
};

export function ComplexitySection({
  prefix,
  title = "Complexity Multipliers",
  description = "Adjust pricing based on job complexity",
  defaults = DEFAULT_COMPLEXITY,
}: ComplexitySectionProps) {
  return (
    <SettingsSection icon={Gauge} title={title} description={description}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SettingsInput
          name={`${prefix}ComplexitySimple`}
          label="Simple"
          unit="x"
          step={0.05}
          placeholder={String(defaults.simple)}
          hint={`Default: ${defaults.simple}x`}
        />
        <SettingsInput
          name={`${prefix}ComplexityStandard`}
          label="Standard"
          unit="x"
          step={0.05}
          placeholder={String(defaults.standard)}
          hint={`Default: ${defaults.standard}x`}
        />
        <SettingsInput
          name={`${prefix}ComplexityComplex`}
          label="Complex"
          unit="x"
          step={0.05}
          placeholder={String(defaults.complex)}
          hint={`Default: ${defaults.complex}x`}
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        These multipliers adjust labor costs based on job difficulty. Simple
        jobs (open areas, easy access) use a lower multiplier, while complex
        jobs (tight spaces, custom work) use a higher multiplier.
      </p>
    </SettingsSection>
  );
}
