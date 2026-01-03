"use client";

import { Home, DollarSign, Construction } from "lucide-react";
import { SettingsInput } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { ComplexitySection } from "@/components/settings/shared";
import { PresetMaterialPricesSection } from "@/components/settings/PresetMaterialPricesSection";
import { CustomMaterialsSection } from "@/components/settings/CustomMaterialsSection";
import {
  FRAMING_RATES,
  FRAMING_ADDONS,
  FRAMING_COMPLEXITY_MULTIPLIERS,
} from "@/lib/trades/framing/constants";

export function FramingSettings() {
  const getDefaultAddonPrice = (id: string) =>
    FRAMING_ADDONS.find((a) => a.id === id)?.price ?? 0;

  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Construction className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">
              Framing Estimates Coming Soon
            </p>
            <p className="text-sm text-amber-600">
              Configure your framing rates now. Full estimation wizard will be
              available in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Labor Rates */}
      <SettingsSection
        icon={Home}
        title="Framing Rates"
        description="Your default rates for framing work"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SettingsInput
            name="framingLaborPerLinearFt"
            label="Labor (Wall)"
            unit="$/linear ft"
            placeholder={String(FRAMING_RATES.labor_per_linear_ft.mid)}
            hint={`Industry: $${FRAMING_RATES.labor_per_linear_ft.low} - $${FRAMING_RATES.labor_per_linear_ft.high}`}
          />
          <SettingsInput
            name="framingLaborPerSqft"
            label="Labor (Floor/Ceiling)"
            unit="$/sqft"
            placeholder={String(FRAMING_RATES.labor_per_sqft.mid)}
            hint={`Industry: $${FRAMING_RATES.labor_per_sqft.low.toFixed(
              2
            )} - $${FRAMING_RATES.labor_per_sqft.high.toFixed(2)}`}
          />
          <SettingsInput
            name="framingMaterialMarkup"
            label="Material Markup"
            unit="%"
            max={100}
            step={1}
            placeholder={String(FRAMING_RATES.material_markup.mid)}
            hint={`Industry: ${FRAMING_RATES.material_markup.low}% - ${FRAMING_RATES.material_markup.high}%`}
          />
        </div>
      </SettingsSection>

      {/* Add-ons */}
      <SettingsSection
        icon={DollarSign}
        title="Framing Add-ons"
        description="Default prices for framing extras"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="framingBlocking"
            label="Blocking"
            unit="$/each"
            step={1}
            placeholder={String(getDefaultAddonPrice("blocking"))}
            hint={`Default: $${getDefaultAddonPrice("blocking")}/each`}
          />
          <SettingsInput
            name="framingHeaderUpgrade"
            label="Header Upgrade (LVL)"
            unit="$/each"
            step={5}
            placeholder={String(getDefaultAddonPrice("header_upgrade"))}
            hint={`Default: $${getDefaultAddonPrice("header_upgrade")}/each`}
          />
          <SettingsInput
            name="framingFireBlocking"
            label="Fire Blocking"
            unit="$/linear ft"
            placeholder={String(getDefaultAddonPrice("fire_blocking"))}
            hint={`Default: $${getDefaultAddonPrice(
              "fire_blocking"
            )}/linear ft`}
          />
          <SettingsInput
            name="framingDemolition"
            label="Demolition"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("demolition"))}
            hint={`Default: $${getDefaultAddonPrice("demolition")}/sqft`}
          />
        </div>
      </SettingsSection>

      {/* Complexity */}
      <ComplexitySection
        prefix="framing"
        defaults={FRAMING_COMPLEXITY_MULTIPLIERS}
      />

      {/* Preset Materials */}
      <PresetMaterialPricesSection trade="framing" />

      {/* Custom Materials */}
      <CustomMaterialsSection trade="framing" />
    </div>
  );
}
