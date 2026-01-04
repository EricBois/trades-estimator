"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Building2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useUpdateProfile, CustomRates } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DRYWALL_RATES,
  DRYWALL_ADDONS,
} from "@/lib/trades/drywallFinishing/constants";
import {
  HANGING_RATES,
  HANGING_ADDONS,
} from "@/lib/trades/drywallHanging/constants";
import {
  PAINTING_RATES,
  PAINTING_ADDONS,
  PAINTING_COMPLEXITY_MULTIPLIERS,
} from "@/lib/trades/painting/constants";
import {
  FRAMING_RATES,
  FRAMING_ADDONS,
  FRAMING_COMPLEXITY_MULTIPLIERS,
} from "@/lib/trades/framing/constants";
import { Form } from "@/components/ui/Form";
import { SettingsTextInput, SettingsInput } from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { settingsSchema, SettingsFormData } from "@/lib/schemas/settingsSchema";
import {
  TradeNavigation,
  TradeTab,
} from "@/components/settings/TradeNavigation";
import {
  DrywallHangingSettings,
  DrywallFinishingSettings,
  PaintingSettings,
  FramingSettings,
} from "@/components/settings/trades";

// Default complexity values
const DEFAULT_COMPLEXITY = {
  simple: 0.85,
  standard: 1.0,
  complex: 1.3,
};

interface SettingsContentProps {
  profile: {
    id: string;
    companyName: string | null;
    hourlyRate: number | null;
    customRates: CustomRates | null;
  } | null;
}

export function SettingsContent({ profile }: SettingsContentProps) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const { refreshProfile } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTrade, setActiveTrade] = useState<TradeTab>("hanging");

  // Helper functions for getting default addon prices
  const getDefaultAddonPrice = (id: string) =>
    DRYWALL_ADDONS.find((a) => a.id === id)?.price ?? 0;
  const getDefaultHangingAddonPrice = (id: string) =>
    HANGING_ADDONS.find((a) => a.id === id)?.price ?? 0;
  const getDefaultPaintingAddonPrice = (id: string) =>
    PAINTING_ADDONS.find((a) => a.id === id)?.price ?? 0;
  const getDefaultFramingAddonPrice = (id: string) =>
    FRAMING_ADDONS.find((a) => a.id === id)?.price ?? 0;

  // Get existing rates from profile
  const existingRates = profile?.customRates?.drywall_finishing;
  const existingAddons = profile?.customRates?.drywall_addons;
  const existingHangingRates = profile?.customRates?.drywall_hanging;
  const existingHangingAddons = profile?.customRates?.drywall_hanging_addons;
  const existingPaintingRates = profile?.customRates?.painting;
  const existingPaintingAddons = profile?.customRates?.painting_addons;
  const existingFramingRates = profile?.customRates?.framing;
  const existingFramingAddons = profile?.customRates?.framing_addons;
  const existingHangingComplexity =
    profile?.customRates?.drywall_hanging_complexity;
  const existingFinishingComplexity =
    profile?.customRates?.drywall_finishing_complexity;
  const existingPaintingComplexity = profile?.customRates?.painting_complexity;
  const existingFramingComplexity = profile?.customRates?.framing_complexity;

  const defaultValues: SettingsFormData = {
    // Profile
    companyName: profile?.companyName ?? "",
    hourlyRate: profile?.hourlyRate ?? undefined,

    // Drywall Finishing rates
    sqftStandard:
      existingRates?.sqft_standard ?? DRYWALL_RATES.sqft_standard.mid,
    sqftPremium: existingRates?.sqft_premium ?? DRYWALL_RATES.sqft_premium.mid,
    linearJoints:
      existingRates?.linear_joints ?? DRYWALL_RATES.linear_joints.mid,
    linearCorners:
      existingRates?.linear_corners ?? DRYWALL_RATES.linear_corners.mid,

    // Drywall Finishing addons
    addonSanding: existingAddons?.sanding ?? getDefaultAddonPrice("sanding"),
    addonPrimer: existingAddons?.primer ?? getDefaultAddonPrice("primer"),
    addonRepairHoles:
      existingAddons?.repair_holes ?? getDefaultAddonPrice("repair_holes"),
    addonTextureMatch:
      existingAddons?.texture_match ?? getDefaultAddonPrice("texture_match"),
    addonHighCeiling:
      existingAddons?.high_ceiling ?? getDefaultAddonPrice("high_ceiling"),
    addonDustBarrier:
      existingAddons?.dust_barrier ?? getDefaultAddonPrice("dust_barrier"),

    // Drywall Finishing complexity
    finishingComplexitySimple:
      existingFinishingComplexity?.simple ?? DEFAULT_COMPLEXITY.simple,
    finishingComplexityStandard:
      existingFinishingComplexity?.standard ?? DEFAULT_COMPLEXITY.standard,
    finishingComplexityComplex:
      existingFinishingComplexity?.complex ?? DEFAULT_COMPLEXITY.complex,

    // Drywall Hanging rates
    hangingLaborPerSqft:
      existingHangingRates?.labor_per_sqft ?? HANGING_RATES.labor_per_sqft.mid,
    hangingMaterialMarkup:
      existingHangingRates?.material_markup ??
      HANGING_RATES.material_markup.mid,
    hangingDefaultWaste: existingHangingRates?.default_waste_factor ?? 0.12,

    // Drywall Hanging addons
    hangingDelivery:
      existingHangingAddons?.delivery ??
      getDefaultHangingAddonPrice("delivery"),
    hangingStocking:
      existingHangingAddons?.stocking ??
      getDefaultHangingAddonPrice("stocking"),
    hangingDebrisRemoval:
      existingHangingAddons?.debris_removal ??
      getDefaultHangingAddonPrice("debris_removal"),
    hangingCornerBead:
      existingHangingAddons?.corner_bead ??
      getDefaultHangingAddonPrice("corner_bead"),
    hangingInsulation:
      existingHangingAddons?.insulation ??
      getDefaultHangingAddonPrice("insulation"),
    hangingVaporBarrier:
      existingHangingAddons?.vapor_barrier ??
      getDefaultHangingAddonPrice("vapor_barrier"),

    // Drywall Hanging complexity
    hangingComplexitySimple:
      existingHangingComplexity?.simple ?? DEFAULT_COMPLEXITY.simple,
    hangingComplexityStandard:
      existingHangingComplexity?.standard ?? DEFAULT_COMPLEXITY.standard,
    hangingComplexityComplex:
      existingHangingComplexity?.complex ?? DEFAULT_COMPLEXITY.complex,

    // Drywall Hanging ceiling height multipliers
    hangingCeilingStandardMultiplier:
      existingHangingRates?.ceiling_height_multipliers?.standard ?? 1.0,
    hangingCeilingNineFtMultiplier:
      existingHangingRates?.ceiling_height_multipliers?.nine_ft ?? 1.1,
    hangingCeilingTenFtMultiplier:
      existingHangingRates?.ceiling_height_multipliers?.ten_ft ?? 1.15,
    hangingCeilingCathedralMultiplier:
      existingHangingRates?.ceiling_height_multipliers?.cathedral ?? 1.35,
    hangingCeilingMultiplierAppliesTo:
      existingHangingRates?.ceiling_multiplier_applies_to ?? "all",

    // Painting rates
    paintingLaborPerSqft:
      existingPaintingRates?.labor_per_sqft ??
      PAINTING_RATES.labor_per_sqft.mid,
    paintingMaterialPerSqft:
      existingPaintingRates?.material_per_sqft ??
      PAINTING_RATES.material_per_sqft.mid,
    paintingCeilingModifier:
      existingPaintingRates?.ceiling_modifier ??
      PAINTING_RATES.ceiling_modifier.mid,

    // Painting addons
    paintingTrimPaint:
      existingPaintingAddons?.trim_paint ??
      getDefaultPaintingAddonPrice("trim_paint"),
    paintingDoorPaint:
      existingPaintingAddons?.door_paint ??
      getDefaultPaintingAddonPrice("door_paint"),
    paintingCabinetPaint:
      existingPaintingAddons?.cabinet_paint ??
      getDefaultPaintingAddonPrice("cabinet_paint"),
    paintingCeilingTexture:
      existingPaintingAddons?.ceiling_texture ??
      getDefaultPaintingAddonPrice("ceiling_texture"),
    paintingAccentWall:
      existingPaintingAddons?.accent_wall ??
      getDefaultPaintingAddonPrice("accent_wall"),
    paintingWallpaperRemoval:
      existingPaintingAddons?.wallpaper_removal ??
      getDefaultPaintingAddonPrice("wallpaper_removal"),
    paintingHighCeiling:
      existingPaintingAddons?.high_ceiling ??
      getDefaultPaintingAddonPrice("high_ceiling"),
    paintingFurnitureMoving:
      existingPaintingAddons?.furniture_moving ??
      getDefaultPaintingAddonPrice("furniture_moving"),

    // Painting complexity
    paintingComplexitySimple:
      existingPaintingComplexity?.simple ??
      PAINTING_COMPLEXITY_MULTIPLIERS.simple,
    paintingComplexityStandard:
      existingPaintingComplexity?.standard ??
      PAINTING_COMPLEXITY_MULTIPLIERS.standard,
    paintingComplexityComplex:
      existingPaintingComplexity?.complex ??
      PAINTING_COMPLEXITY_MULTIPLIERS.complex,

    // Framing rates
    framingLaborPerLinearFt:
      existingFramingRates?.labor_per_linear_ft ??
      FRAMING_RATES.labor_per_linear_ft.mid,
    framingLaborPerSqft:
      existingFramingRates?.labor_per_sqft ?? FRAMING_RATES.labor_per_sqft.mid,
    framingMaterialMarkup:
      existingFramingRates?.material_markup ??
      FRAMING_RATES.material_markup.mid,

    // Framing addons
    framingBlocking:
      existingFramingAddons?.blocking ??
      getDefaultFramingAddonPrice("blocking"),
    framingHeaderUpgrade:
      existingFramingAddons?.header_upgrade ??
      getDefaultFramingAddonPrice("header_upgrade"),
    framingFireBlocking:
      existingFramingAddons?.fire_blocking ??
      getDefaultFramingAddonPrice("fire_blocking"),
    framingDemolition:
      existingFramingAddons?.demolition ??
      getDefaultFramingAddonPrice("demolition"),

    // Framing complexity
    framingComplexitySimple:
      existingFramingComplexity?.simple ??
      FRAMING_COMPLEXITY_MULTIPLIERS.simple,
    framingComplexityStandard:
      existingFramingComplexity?.standard ??
      FRAMING_COMPLEXITY_MULTIPLIERS.standard,
    framingComplexityComplex:
      existingFramingComplexity?.complex ??
      FRAMING_COMPLEXITY_MULTIPLIERS.complex,
  };

  const handleSubmit = async (data: SettingsFormData) => {
    if (!profile) return;

    // Build customRates object preserving existing fields
    const customRates: CustomRates = {
      ...profile.customRates,
      // Drywall Finishing
      drywall_finishing: {
        sqft_standard: data.sqftStandard,
        sqft_premium: data.sqftPremium,
        linear_joints: data.linearJoints,
        linear_corners: data.linearCorners,
      },
      drywall_addons: {
        sanding: data.addonSanding,
        primer: data.addonPrimer,
        repair_holes: data.addonRepairHoles,
        texture_match: data.addonTextureMatch,
        high_ceiling: data.addonHighCeiling,
        dust_barrier: data.addonDustBarrier,
      },
      drywall_finishing_complexity: {
        simple: data.finishingComplexitySimple,
        standard: data.finishingComplexityStandard,
        complex: data.finishingComplexityComplex,
      },
      // Drywall Hanging
      drywall_hanging: {
        labor_per_sqft: data.hangingLaborPerSqft,
        material_markup: data.hangingMaterialMarkup,
        default_waste_factor: data.hangingDefaultWaste,
        ceiling_height_multipliers: {
          standard: data.hangingCeilingStandardMultiplier,
          nine_ft: data.hangingCeilingNineFtMultiplier,
          ten_ft: data.hangingCeilingTenFtMultiplier,
          cathedral: data.hangingCeilingCathedralMultiplier,
        },
        ceiling_multiplier_applies_to: data.hangingCeilingMultiplierAppliesTo,
      },
      drywall_hanging_addons: {
        delivery: data.hangingDelivery,
        stocking: data.hangingStocking,
        debris_removal: data.hangingDebrisRemoval,
        corner_bead: data.hangingCornerBead,
        insulation: data.hangingInsulation,
        vapor_barrier: data.hangingVaporBarrier,
      },
      drywall_hanging_complexity: {
        simple: data.hangingComplexitySimple,
        standard: data.hangingComplexityStandard,
        complex: data.hangingComplexityComplex,
      },
      // Painting
      painting: {
        labor_per_sqft: data.paintingLaborPerSqft,
        material_per_sqft: data.paintingMaterialPerSqft,
        ceiling_modifier: data.paintingCeilingModifier,
      },
      painting_addons: {
        trim_paint: data.paintingTrimPaint,
        door_paint: data.paintingDoorPaint,
        cabinet_paint: data.paintingCabinetPaint,
        ceiling_texture: data.paintingCeilingTexture,
        accent_wall: data.paintingAccentWall,
        wallpaper_removal: data.paintingWallpaperRemoval,
        high_ceiling: data.paintingHighCeiling,
        furniture_moving: data.paintingFurnitureMoving,
      },
      painting_complexity: {
        simple: data.paintingComplexitySimple,
        standard: data.paintingComplexityStandard,
        complex: data.paintingComplexityComplex,
      },
      // Framing
      framing: {
        labor_per_linear_ft: data.framingLaborPerLinearFt,
        labor_per_sqft: data.framingLaborPerSqft,
        material_markup: data.framingMaterialMarkup,
      },
      framing_addons: {
        blocking: data.framingBlocking,
        header_upgrade: data.framingHeaderUpgrade,
        fire_blocking: data.framingFireBlocking,
        demolition: data.framingDemolition,
      },
      framing_complexity: {
        simple: data.framingComplexitySimple,
        standard: data.framingComplexityStandard,
        complex: data.framingComplexityComplex,
      },
    };

    await updateProfile.mutateAsync({
      id: profile.id,
      companyName: data.companyName || "",
      hourlyRate: data.hourlyRate ?? null,
      customRates,
    });

    setSaveSuccess(true);
    await refreshProfile();
    router.refresh();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-500">
            Manage your rates and preferences by trade
          </p>
        </div>

        <Form
          schema={settingsSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            {/* Profile Section - Always visible */}
            <SettingsSection icon={Building2} title="Company Profile">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsTextInput
                  name="companyName"
                  label="Company Name"
                  placeholder="Your Company Name"
                />
                <SettingsInput
                  name="hourlyRate"
                  label="Default Hourly Rate"
                  unit="$/hr"
                  step={0.01}
                  placeholder="75.00"
                  hint="Used for calculating estimate ranges"
                />
              </div>
            </SettingsSection>

            {/* Trade Navigation */}
            <TradeNavigation
              activeTrade={activeTrade}
              onTradeSelect={setActiveTrade}
            />

            {/* Trade-specific settings */}
            {activeTrade === "hanging" && <DrywallHangingSettings />}
            {activeTrade === "finishing" && <DrywallFinishingSettings />}
            {activeTrade === "painting" && <PaintingSettings />}
            {activeTrade === "framing" && <FramingSettings />}

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium",
                  "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                )}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </>
                )}
              </button>

              {saveSuccess && (
                <span className="text-sm text-green-600 font-medium">
                  Settings saved successfully!
                </span>
              )}
            </div>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
