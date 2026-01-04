"use client";

import { Hammer, DollarSign, Ruler } from "lucide-react";
import { SettingsInput, SettingsSelect } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { ComplexitySection } from "@/components/settings/shared";
import { PresetMaterialPricesSection } from "@/components/settings/PresetMaterialPricesSection";
import { CustomMaterialsSection } from "@/components/settings/CustomMaterialsSection";
import {
  HANGING_RATES,
  WASTE_FACTORS,
  HANGING_ADDONS,
  CEILING_HEIGHT_FACTORS,
} from "@/lib/trades/drywallHanging/constants";

export function DrywallHangingSettings() {
  const getDefaultAddonPrice = (id: string) =>
    HANGING_ADDONS.find((a) => a.id === id)?.price ?? 0;

  return (
    <div className="space-y-6">
      {/* Labor Rates */}
      <SettingsSection
        icon={Hammer}
        title="Hanging Rates"
        description="Your default rates for drywall installation"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="hangingLaborPerSqft"
            label="Labor Per Sqft"
            unit="$/sqft"
            placeholder={String(HANGING_RATES.labor_per_sqft.mid)}
            hint={`Industry: $${HANGING_RATES.labor_per_sqft.low.toFixed(
              2
            )} - $${HANGING_RATES.labor_per_sqft.high.toFixed(2)}`}
          />
          <SettingsInput
            name="hangingMaterialMarkup"
            label="Material Markup"
            unit="%"
            max={100}
            step={1}
            placeholder={String(HANGING_RATES.material_markup.mid)}
            hint={`Industry: ${HANGING_RATES.material_markup.low}% - ${HANGING_RATES.material_markup.high}%`}
          />
          <SettingsSelect
            name="hangingDefaultWaste"
            label="Default Waste Factor"
            options={WASTE_FACTORS.map((wf) => ({
              value: wf.value,
              label: wf.label,
            }))}
            hint="Applied to calculated sheet quantities"
          />
        </div>
      </SettingsSection>

      {/* Add-ons */}
      <SettingsSection
        icon={DollarSign}
        title="Hanging Add-ons"
        description="Default prices for installation add-ons"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="hangingDelivery"
            label="Delivery"
            unit="flat"
            step={5}
            placeholder={String(getDefaultAddonPrice("delivery"))}
            hint={`Default: $${getDefaultAddonPrice("delivery")}`}
          />
          <SettingsInput
            name="hangingStocking"
            label="Stocking (Carry In)"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("stocking"))}
            hint={`Default: $${getDefaultAddonPrice("stocking")}/sqft`}
          />
          <SettingsInput
            name="hangingDebrisRemoval"
            label="Debris Removal"
            unit="flat"
            step={10}
            placeholder={String(getDefaultAddonPrice("debris_removal"))}
            hint={`Default: $${getDefaultAddonPrice("debris_removal")}`}
          />
          <SettingsInput
            name="hangingCornerBead"
            label="Corner Bead"
            unit="$/linear ft"
            step={0.25}
            placeholder={String(getDefaultAddonPrice("corner_bead"))}
            hint={`Default: $${getDefaultAddonPrice("corner_bead")}/linear ft`}
          />
          <SettingsInput
            name="hangingInsulation"
            label="Insulation (R-13)"
            unit="$/sqft"
            step={0.05}
            placeholder={String(getDefaultAddonPrice("insulation"))}
            hint={`Default: $${getDefaultAddonPrice("insulation")}/sqft`}
          />
          <SettingsInput
            name="hangingVaporBarrier"
            label="Vapor Barrier"
            unit="$/sqft"
            step={0.05}
            placeholder={String(getDefaultAddonPrice("vapor_barrier"))}
            hint={`Default: $${getDefaultAddonPrice("vapor_barrier")}/sqft`}
          />
        </div>
      </SettingsSection>

      {/* Complexity */}
      <ComplexitySection prefix="hanging" />

      {/* Ceiling Height Multipliers */}
      <SettingsSection
        icon={Ruler}
        title="Ceiling Height Multipliers"
        description="Adjust labor rates for different ceiling heights"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="hangingCeilingStandardMultiplier"
            label={CEILING_HEIGHT_FACTORS[0].label}
            unit="×"
            step={0.05}
            placeholder="1.0"
            hint="Base rate (1.0 = no adjustment)"
          />
          <SettingsInput
            name="hangingCeilingNineFtMultiplier"
            label={CEILING_HEIGHT_FACTORS[1].label}
            unit="×"
            step={0.05}
            placeholder="1.1"
            hint={`Default: ${CEILING_HEIGHT_FACTORS[1].multiplier}× (${(
              (CEILING_HEIGHT_FACTORS[1].multiplier - 1) *
              100
            ).toFixed(0)}% more)`}
          />
          <SettingsInput
            name="hangingCeilingTenFtMultiplier"
            label={CEILING_HEIGHT_FACTORS[2].label}
            unit="×"
            step={0.05}
            placeholder="1.15"
            hint={`Default: ${CEILING_HEIGHT_FACTORS[2].multiplier}× (${(
              (CEILING_HEIGHT_FACTORS[2].multiplier - 1) *
              100
            ).toFixed(0)}% more)`}
          />
          <SettingsInput
            name="hangingCeilingCathedralMultiplier"
            label={CEILING_HEIGHT_FACTORS[3].label}
            unit="×"
            step={0.05}
            placeholder="1.35"
            hint={`Default: ${CEILING_HEIGHT_FACTORS[3].multiplier}× (${(
              (CEILING_HEIGHT_FACTORS[3].multiplier - 1) *
              100
            ).toFixed(0)}% more)`}
          />
        </div>
        <div className="mt-4">
          <SettingsSelect
            name="hangingCeilingMultiplierAppliesTo"
            label="Multiplier Applies To"
            options={[
              { value: "all", label: "All sqft (walls + ceiling)" },
              { value: "ceiling_only", label: "Ceiling sqft only" },
              { value: "walls_only", label: "Wall sqft only" },
            ]}
            valueAsNumber={false}
            hint="Choose what the ceiling height multiplier affects"
          />
        </div>
      </SettingsSection>

      {/* Preset Materials */}
      <PresetMaterialPricesSection trade="drywall_hanging" />

      {/* Custom Materials */}
      <CustomMaterialsSection trade="drywall_hanging" />
    </div>
  );
}
