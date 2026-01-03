"use client";

import { Paintbrush, DollarSign } from "lucide-react";
import { SettingsInput } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { ComplexitySection } from "@/components/settings/shared";
import { PresetMaterialPricesSection } from "@/components/settings/PresetMaterialPricesSection";
import { CustomMaterialsSection } from "@/components/settings/CustomMaterialsSection";
import {
  PAINTING_RATES,
  PAINTING_ADDONS,
  PAINTING_COMPLEXITY_MULTIPLIERS,
} from "@/lib/trades/painting/constants";

export function PaintingSettings() {
  const getDefaultAddonPrice = (id: string) =>
    PAINTING_ADDONS.find((a) => a.id === id)?.price ?? 0;

  return (
    <div className="space-y-6">
      {/* Labor Rates */}
      <SettingsSection
        icon={Paintbrush}
        title="Painting Rates"
        description="Your default rates for painting"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SettingsInput
            name="paintingLaborPerSqft"
            label="Labor"
            unit="$/sqft"
            placeholder={String(PAINTING_RATES.labor_per_sqft.mid)}
            hint={`Industry: $${PAINTING_RATES.labor_per_sqft.low.toFixed(
              2
            )} - $${PAINTING_RATES.labor_per_sqft.high.toFixed(2)}`}
          />
          <SettingsInput
            name="paintingMaterialPerSqft"
            label="Material"
            unit="$/sqft"
            placeholder={String(PAINTING_RATES.material_per_sqft.mid)}
            hint={`Industry: $${PAINTING_RATES.material_per_sqft.low.toFixed(
              2
            )} - $${PAINTING_RATES.material_per_sqft.high.toFixed(2)}`}
          />
          <SettingsInput
            name="paintingCeilingModifier"
            label="Ceiling Modifier"
            unit="x"
            step={0.05}
            placeholder={String(PAINTING_RATES.ceiling_modifier.mid)}
            hint={`Industry: ${PAINTING_RATES.ceiling_modifier.low.toFixed(
              2
            )}x - ${PAINTING_RATES.ceiling_modifier.high.toFixed(2)}x`}
          />
        </div>
      </SettingsSection>

      {/* Add-ons */}
      <SettingsSection
        icon={DollarSign}
        title="Painting Add-ons"
        description="Default prices for painting extras"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsInput
            name="paintingTrimPaint"
            label="Trim & Baseboards"
            unit="$/linear ft"
            step={0.25}
            placeholder={String(getDefaultAddonPrice("trim_paint"))}
            hint={`Default: $${getDefaultAddonPrice("trim_paint")}/linear ft`}
          />
          <SettingsInput
            name="paintingDoorPaint"
            label="Door Painting"
            unit="$/each"
            step={5}
            placeholder={String(getDefaultAddonPrice("door_paint"))}
            hint={`Default: $${getDefaultAddonPrice("door_paint")}/each`}
          />
          <SettingsInput
            name="paintingCabinetPaint"
            label="Cabinet Painting"
            unit="$/each"
            step={10}
            placeholder={String(getDefaultAddonPrice("cabinet_paint"))}
            hint={`Default: $${getDefaultAddonPrice("cabinet_paint")}/each`}
          />
          <SettingsInput
            name="paintingCeilingTexture"
            label="Ceiling Texture"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("ceiling_texture"))}
            hint={`Default: $${getDefaultAddonPrice("ceiling_texture")}/sqft`}
          />
          <SettingsInput
            name="paintingAccentWall"
            label="Accent Wall"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("accent_wall"))}
            hint={`Default: $${getDefaultAddonPrice("accent_wall")}/sqft`}
          />
          <SettingsInput
            name="paintingWallpaperRemoval"
            label="Wallpaper Removal"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("wallpaper_removal"))}
            hint={`Default: $${getDefaultAddonPrice("wallpaper_removal")}/sqft`}
          />
          <SettingsInput
            name="paintingHighCeiling"
            label="High Ceiling (10ft+)"
            unit="$/sqft"
            placeholder={String(getDefaultAddonPrice("high_ceiling"))}
            hint={`Default: $${getDefaultAddonPrice("high_ceiling")}/sqft`}
          />
          <SettingsInput
            name="paintingFurnitureMoving"
            label="Furniture Moving"
            unit="flat"
            step={10}
            placeholder={String(getDefaultAddonPrice("furniture_moving"))}
            hint={`Default: $${getDefaultAddonPrice("furniture_moving")}`}
          />
        </div>
      </SettingsSection>

      {/* Complexity */}
      <ComplexitySection
        prefix="painting"
        defaults={PAINTING_COMPLEXITY_MULTIPLIERS}
      />

      {/* Preset Materials */}
      <PresetMaterialPricesSection trade="painting" />

      {/* Custom Materials */}
      <CustomMaterialsSection trade="painting" />
    </div>
  );
}
