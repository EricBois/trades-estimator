"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Building2,
  DollarSign,
  Ruler,
  Hammer,
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
  WASTE_FACTORS,
  HANGING_ADDONS,
} from "@/lib/trades/drywallHanging/constants";
import { Form } from "@/components/ui/Form";
import {
  SettingsTextInput,
  SettingsInput,
  SettingsSelect,
} from "@/components/ui/FormInput";
import { SettingsSection } from "@/components/ui/SettingsSection";
import { settingsSchema, SettingsFormData } from "@/lib/schemas/settingsSchema";

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

  const getDefaultAddonPrice = (id: string) =>
    DRYWALL_ADDONS.find((a) => a.id === id)?.price ?? 0;
  const getDefaultHangingAddonPrice = (id: string) =>
    HANGING_ADDONS.find((a) => a.id === id)?.price ?? 0;

  const existingRates = profile?.customRates?.drywall_finishing;
  const existingAddons = profile?.customRates?.drywall_addons;
  const existingHangingRates = profile?.customRates?.drywall_hanging;
  const existingHangingAddons = profile?.customRates?.drywall_hanging_addons;

  const defaultValues: SettingsFormData = {
    companyName: profile?.companyName ?? "",
    hourlyRate: profile?.hourlyRate ?? undefined,
    // Drywall rates
    sqftStandard:
      existingRates?.sqft_standard ?? DRYWALL_RATES.sqft_standard.mid,
    sqftPremium: existingRates?.sqft_premium ?? DRYWALL_RATES.sqft_premium.mid,
    linearJoints:
      existingRates?.linear_joints ?? DRYWALL_RATES.linear_joints.mid,
    linearCorners:
      existingRates?.linear_corners ?? DRYWALL_RATES.linear_corners.mid,
    // Drywall addons
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
    // Hanging rates
    hangingLaborPerSheet:
      existingHangingRates?.labor_per_sheet ??
      HANGING_RATES.labor_per_sheet.mid,
    hangingLaborPerSqft:
      existingHangingRates?.labor_per_sqft ?? HANGING_RATES.labor_per_sqft.mid,
    hangingMaterialMarkup:
      existingHangingRates?.material_markup ??
      HANGING_RATES.material_markup.mid,
    hangingDefaultWaste: existingHangingRates?.default_waste_factor ?? 0.12,
    // Hanging addons
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
  };

  const handleSubmit = async (data: SettingsFormData) => {
    if (!profile) return;

    const customRates: CustomRates = {
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
      drywall_hanging: {
        labor_per_sheet: data.hangingLaborPerSheet,
        labor_per_sqft: data.hangingLaborPerSqft,
        material_markup: data.hangingMaterialMarkup,
        default_waste_factor: data.hangingDefaultWaste,
      },
      drywall_hanging_addons: {
        delivery: data.hangingDelivery,
        stocking: data.hangingStocking,
        debris_removal: data.hangingDebrisRemoval,
        corner_bead: data.hangingCornerBead,
        insulation: data.hangingInsulation,
        vapor_barrier: data.hangingVaporBarrier,
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>

        <Form
          schema={settingsSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            {/* Company Profile Section */}
            <SettingsSection icon={Building2} title="Company Profile">
              <div className="space-y-4">
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

            {/* Drywall Finishing Rates Section */}
            <SettingsSection
              icon={Ruler}
              title="Drywall Finishing Rates"
              description="Your default rates for drywall estimates"
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

            {/* Drywall Add-ons Section */}
            <SettingsSection
              icon={DollarSign}
              title="Add-on Prices"
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
                  hint={`Default: $${getDefaultAddonPrice(
                    "repair_holes"
                  )}/each`}
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
                  hint={`Default: $${getDefaultAddonPrice(
                    "high_ceiling"
                  )}/sqft`}
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

            {/* Drywall Hanging Rates Section */}
            <SettingsSection
              icon={Hammer}
              title="Drywall Hanging Rates"
              description="Your default rates for drywall installation"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsInput
                  name="hangingLaborPerSheet"
                  label="Labor Per Sheet"
                  unit="$/sheet"
                  step={0.5}
                  placeholder={String(HANGING_RATES.labor_per_sheet.mid)}
                  hint={`Industry: $${HANGING_RATES.labor_per_sheet.low} - $${HANGING_RATES.labor_per_sheet.high}`}
                />
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

            {/* Drywall Hanging Add-ons Section */}
            <SettingsSection
              icon={DollarSign}
              title="Hanging Add-on Prices"
              description="Default prices for installation add-ons"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsInput
                  name="hangingDelivery"
                  label="Delivery"
                  unit="flat"
                  step={5}
                  placeholder={String(getDefaultHangingAddonPrice("delivery"))}
                  hint={`Default: $${getDefaultHangingAddonPrice("delivery")}`}
                />
                <SettingsInput
                  name="hangingStocking"
                  label="Stocking (Carry In)"
                  unit="$/sqft"
                  placeholder={String(getDefaultHangingAddonPrice("stocking"))}
                  hint={`Default: $${getDefaultHangingAddonPrice(
                    "stocking"
                  )}/sqft`}
                />
                <SettingsInput
                  name="hangingDebrisRemoval"
                  label="Debris Removal"
                  unit="flat"
                  step={10}
                  placeholder={String(
                    getDefaultHangingAddonPrice("debris_removal")
                  )}
                  hint={`Default: $${getDefaultHangingAddonPrice(
                    "debris_removal"
                  )}`}
                />
                <SettingsInput
                  name="hangingCornerBead"
                  label="Corner Bead"
                  unit="$/linear ft"
                  step={0.25}
                  placeholder={String(
                    getDefaultHangingAddonPrice("corner_bead")
                  )}
                  hint={`Default: $${getDefaultHangingAddonPrice(
                    "corner_bead"
                  )}/linear ft`}
                />
                <SettingsInput
                  name="hangingInsulation"
                  label="Insulation (R-13)"
                  unit="$/sqft"
                  step={0.05}
                  placeholder={String(
                    getDefaultHangingAddonPrice("insulation")
                  )}
                  hint={`Default: $${getDefaultHangingAddonPrice(
                    "insulation"
                  )}/sqft`}
                />
                <SettingsInput
                  name="hangingVaporBarrier"
                  label="Vapor Barrier"
                  unit="$/sqft"
                  step={0.05}
                  placeholder={String(
                    getDefaultHangingAddonPrice("vapor_barrier")
                  )}
                  hint={`Default: $${getDefaultHangingAddonPrice(
                    "vapor_barrier"
                  )}/sqft`}
                />
              </div>
            </SettingsSection>

            {/* Save Button */}
            <div className="flex items-center gap-4">
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
                    Save Changes
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
