"use client";

import { Hammer, DollarSign } from "lucide-react";
import { SettingsInput, SettingsSelect } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { ComplexitySection } from "@/components/settings/shared";
import { PresetMaterialPricesSection } from "@/components/settings/PresetMaterialPricesSection";
import { CustomMaterialsSection } from "@/components/settings/CustomMaterialsSection";
import {
  HANGING_RATES,
  WASTE_FACTORS,
  HANGING_ADDONS,
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

      {/* Preset Materials */}
      <PresetMaterialPricesSection trade="drywall_hanging" />

      {/* Custom Materials */}
      <CustomMaterialsSection trade="drywall_hanging" />
    </div>
  );
}
