"use client";

import { Ruler, DollarSign } from "lucide-react";
import { SettingsInput } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { ComplexitySection } from "@/components/settings/shared";
import { PresetMaterialPricesSection } from "@/components/settings/PresetMaterialPricesSection";
import { CustomMaterialsSection } from "@/components/settings/CustomMaterialsSection";
import {
  DRYWALL_RATES,
  DRYWALL_ADDONS,
} from "@/lib/trades/drywallFinishing/constants";

export function DrywallFinishingSettings() {
  const getDefaultAddonPrice = (id: string) =>
    DRYWALL_ADDONS.find((a) => a.id === id)?.price ?? 0;

  return (
    <div className="space-y-6">
      {/* Labor Rates */}
      <SettingsSection
        icon={Ruler}
        title="Finishing Rates"
        description="Your default rates for drywall finishing"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="sqftStandard"
            label="Standard Area"
            unit="$/sqft"
            placeholder={String(DRYWALL_RATES.sqft_standard.mid)}
            hint={`Industry: $${DRYWALL_RATES.sqft_standard.low.toFixed(
              2
            )} - $${DRYWALL_RATES.sqft_standard.high.toFixed(2)}`}
          />
          <SettingsInput
            name="sqftPremium"
            label="Premium Area"
            unit="$/sqft"
            placeholder={String(DRYWALL_RATES.sqft_premium.mid)}
            hint={`Industry: $${DRYWALL_RATES.sqft_premium.low.toFixed(
              2
            )} - $${DRYWALL_RATES.sqft_premium.high.toFixed(2)}`}
          />
          <SettingsInput
            name="linearJoints"
            label="Joints (Tape & Mud)"
            unit="$/linear ft"
            placeholder={String(DRYWALL_RATES.linear_joints.mid)}
            hint={`Industry: $${DRYWALL_RATES.linear_joints.low.toFixed(
              2
            )} - $${DRYWALL_RATES.linear_joints.high.toFixed(2)}`}
          />
          <SettingsInput
            name="linearCorners"
            label="Corner Bead"
            unit="$/linear ft"
            placeholder={String(DRYWALL_RATES.linear_corners.mid)}
            hint={`Industry: $${DRYWALL_RATES.linear_corners.low.toFixed(
              2
            )} - $${DRYWALL_RATES.linear_corners.high.toFixed(2)}`}
          />
        </div>
      </SettingsSection>

      {/* Add-ons */}
      <SettingsSection
        icon={DollarSign}
        title="Finishing Add-ons"
        description="Default prices for common add-ons"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="addonSanding"
            label="Extra Sanding"
            unit="flat"
            step={1}
            placeholder={String(getDefaultAddonPrice("sanding"))}
            hint={`Default: $${getDefaultAddonPrice("sanding")}`}
          />
          <SettingsInput
            name="addonPrimer"
            label="Prime Coat"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("primer"))}
            hint={`Default: $${getDefaultAddonPrice("primer")}/sqft`}
          />
          <SettingsInput
            name="addonRepairHoles"
            label="Hole Repair"
            unit="$/each"
            step={1}
            placeholder={String(getDefaultAddonPrice("repair_holes"))}
            hint={`Default: $${getDefaultAddonPrice("repair_holes")}/each`}
          />
          <SettingsInput
            name="addonTextureMatch"
            label="Texture Matching"
            unit="flat"
            step={1}
            placeholder={String(getDefaultAddonPrice("texture_match"))}
            hint={`Default: $${getDefaultAddonPrice("texture_match")}`}
          />
          <SettingsInput
            name="addonHighCeiling"
            label="High Ceiling Premium"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("high_ceiling"))}
            hint={`Default: $${getDefaultAddonPrice("high_ceiling")}/sqft`}
          />
          <SettingsInput
            name="addonDustBarrier"
            label="Dust Barrier Setup"
            unit="flat"
            step={1}
            placeholder={String(getDefaultAddonPrice("dust_barrier"))}
            hint={`Default: $${getDefaultAddonPrice("dust_barrier")}`}
          />
        </div>
      </SettingsSection>

      {/* Complexity */}
      <ComplexitySection prefix="finishing" />

      {/* Preset Materials */}
      <PresetMaterialPricesSection trade="drywall_finishing" />

      {/* Custom Materials */}
      <CustomMaterialsSection trade="drywall_finishing" />
    </div>
  );
}
