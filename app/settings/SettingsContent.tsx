"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Save, Loader2, Building2, DollarSign, Ruler, RotateCcw } from "lucide-react";
import { Layout } from "@/components/layout";
import { useUpdateProfile, CustomRates } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { DRYWALL_RATES, DRYWALL_ADDONS } from "@/lib/trades/drywallFinishing/constants";
import { getRateRangeInfo, DrywallRateType } from "@/lib/trades/drywallFinishing/rates";

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

  // Form state
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [hourlyRate, setHourlyRate] = useState<number | "">(profile?.hourlyRate ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drywall rates state
  const existingRates = profile?.customRates?.drywall_finishing;
  const [sqftStandard, setSqftStandard] = useState<number | "">(
    existingRates?.sqft_standard ?? DRYWALL_RATES.sqft_standard.mid
  );
  const [sqftPremium, setSqftPremium] = useState<number | "">(
    existingRates?.sqft_premium ?? DRYWALL_RATES.sqft_premium.mid
  );
  const [linearJoints, setLinearJoints] = useState<number | "">(
    existingRates?.linear_joints ?? DRYWALL_RATES.linear_joints.mid
  );
  const [linearCorners, setLinearCorners] = useState<number | "">(
    existingRates?.linear_corners ?? DRYWALL_RATES.linear_corners.mid
  );

  // Add-on prices state
  const existingAddons = profile?.customRates?.drywall_addons;
  const getDefaultAddonPrice = (id: string) => DRYWALL_ADDONS.find(a => a.id === id)?.price ?? 0;

  const [addonSanding, setAddonSanding] = useState<number | "">(
    existingAddons?.sanding ?? getDefaultAddonPrice("sanding")
  );
  const [addonPrimer, setAddonPrimer] = useState<number | "">(
    existingAddons?.primer ?? getDefaultAddonPrice("primer")
  );
  const [addonRepairHoles, setAddonRepairHoles] = useState<number | "">(
    existingAddons?.repair_holes ?? getDefaultAddonPrice("repair_holes")
  );
  const [addonTextureMatch, setAddonTextureMatch] = useState<number | "">(
    existingAddons?.texture_match ?? getDefaultAddonPrice("texture_match")
  );
  const [addonHighCeiling, setAddonHighCeiling] = useState<number | "">(
    existingAddons?.high_ceiling ?? getDefaultAddonPrice("high_ceiling")
  );
  const [addonDustBarrier, setAddonDustBarrier] = useState<number | "">(
    existingAddons?.dust_barrier ?? getDefaultAddonPrice("dust_barrier")
  );

  const resetRatesToDefaults = () => {
    setSqftStandard(DRYWALL_RATES.sqft_standard.mid);
    setSqftPremium(DRYWALL_RATES.sqft_premium.mid);
    setLinearJoints(DRYWALL_RATES.linear_joints.mid);
    setLinearCorners(DRYWALL_RATES.linear_corners.mid);
  };

  const resetAddonsToDefaults = () => {
    setAddonSanding(getDefaultAddonPrice("sanding"));
    setAddonPrimer(getDefaultAddonPrice("primer"));
    setAddonRepairHoles(getDefaultAddonPrice("repair_holes"));
    setAddonTextureMatch(getDefaultAddonPrice("texture_match"));
    setAddonHighCeiling(getDefaultAddonPrice("high_ceiling"));
    setAddonDustBarrier(getDefaultAddonPrice("dust_barrier"));
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Build custom rates object
      const customRates: CustomRates = {
        drywall_finishing: {
          sqft_standard: sqftStandard === "" ? DRYWALL_RATES.sqft_standard.mid : sqftStandard,
          sqft_premium: sqftPremium === "" ? DRYWALL_RATES.sqft_premium.mid : sqftPremium,
          linear_joints: linearJoints === "" ? DRYWALL_RATES.linear_joints.mid : linearJoints,
          linear_corners: linearCorners === "" ? DRYWALL_RATES.linear_corners.mid : linearCorners,
        },
        drywall_addons: {
          sanding: addonSanding === "" ? getDefaultAddonPrice("sanding") : addonSanding,
          primer: addonPrimer === "" ? getDefaultAddonPrice("primer") : addonPrimer,
          repair_holes: addonRepairHoles === "" ? getDefaultAddonPrice("repair_holes") : addonRepairHoles,
          texture_match: addonTextureMatch === "" ? getDefaultAddonPrice("texture_match") : addonTextureMatch,
          high_ceiling: addonHighCeiling === "" ? getDefaultAddonPrice("high_ceiling") : addonHighCeiling,
          dust_barrier: addonDustBarrier === "" ? getDefaultAddonPrice("dust_barrier") : addonDustBarrier,
        },
      };

      await updateProfile.mutateAsync({
        id: profile.id,
        companyName,
        hourlyRate: hourlyRate === "" ? null : hourlyRate,
        customRates,
      });
      setSaveSuccess(true);
      await refreshProfile();
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
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

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Company Profile
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="hourlyRate"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Default Hourly Rate
                </label>
                <input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder="75.00"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Used for calculating estimate ranges
                </p>
              </div>
            </div>
          </section>

          {/* Drywall Finishing Rates Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gray-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Drywall Finishing Rates
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your default rates for drywall estimates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetRatesToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard Area Rate */}
              <div>
                <label
                  htmlFor="sqftStandard"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Standard Area
                  <span className="text-gray-400 font-normal ml-1">$/sqft</span>
                </label>
                <input
                  id="sqftStandard"
                  type="number"
                  value={sqftStandard}
                  onChange={(e) =>
                    setSqftStandard(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(DRYWALL_RATES.sqft_standard.mid)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Industry: ${DRYWALL_RATES.sqft_standard.low.toFixed(2)} - ${DRYWALL_RATES.sqft_standard.high.toFixed(2)}
                </p>
              </div>

              {/* Premium Area Rate */}
              <div>
                <label
                  htmlFor="sqftPremium"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Premium Area
                  <span className="text-gray-400 font-normal ml-1">$/sqft</span>
                </label>
                <input
                  id="sqftPremium"
                  type="number"
                  value={sqftPremium}
                  onChange={(e) =>
                    setSqftPremium(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(DRYWALL_RATES.sqft_premium.mid)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Industry: ${DRYWALL_RATES.sqft_premium.low.toFixed(2)} - ${DRYWALL_RATES.sqft_premium.high.toFixed(2)}
                </p>
              </div>

              {/* Linear Joints Rate */}
              <div>
                <label
                  htmlFor="linearJoints"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Joints (Tape & Mud)
                  <span className="text-gray-400 font-normal ml-1">$/linear ft</span>
                </label>
                <input
                  id="linearJoints"
                  type="number"
                  value={linearJoints}
                  onChange={(e) =>
                    setLinearJoints(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(DRYWALL_RATES.linear_joints.mid)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Industry: ${DRYWALL_RATES.linear_joints.low.toFixed(2)} - ${DRYWALL_RATES.linear_joints.high.toFixed(2)}
                </p>
              </div>

              {/* Linear Corners Rate */}
              <div>
                <label
                  htmlFor="linearCorners"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Corner Bead
                  <span className="text-gray-400 font-normal ml-1">$/linear ft</span>
                </label>
                <input
                  id="linearCorners"
                  type="number"
                  value={linearCorners}
                  onChange={(e) =>
                    setLinearCorners(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(DRYWALL_RATES.linear_corners.mid)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Industry: ${DRYWALL_RATES.linear_corners.low.toFixed(2)} - ${DRYWALL_RATES.linear_corners.high.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* Drywall Add-ons Pricing Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add-on Prices
                  </h2>
                  <p className="text-sm text-gray-500">
                    Default prices for common add-ons
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAddonsToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Extra Sanding */}
              <div>
                <label
                  htmlFor="addonSanding"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Extra Sanding
                  <span className="text-gray-400 font-normal ml-1">flat</span>
                </label>
                <input
                  id="addonSanding"
                  type="number"
                  value={addonSanding}
                  onChange={(e) =>
                    setAddonSanding(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={1}
                  placeholder={String(getDefaultAddonPrice("sanding"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("sanding")}
                </p>
              </div>

              {/* Prime Coat */}
              <div>
                <label
                  htmlFor="addonPrimer"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Prime Coat
                  <span className="text-gray-400 font-normal ml-1">$/sqft</span>
                </label>
                <input
                  id="addonPrimer"
                  type="number"
                  value={addonPrimer}
                  onChange={(e) =>
                    setAddonPrimer(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(getDefaultAddonPrice("primer"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("primer")}/sqft
                </p>
              </div>

              {/* Hole Repair */}
              <div>
                <label
                  htmlFor="addonRepairHoles"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Hole Repair
                  <span className="text-gray-400 font-normal ml-1">$/each</span>
                </label>
                <input
                  id="addonRepairHoles"
                  type="number"
                  value={addonRepairHoles}
                  onChange={(e) =>
                    setAddonRepairHoles(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={1}
                  placeholder={String(getDefaultAddonPrice("repair_holes"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("repair_holes")}/each
                </p>
              </div>

              {/* Texture Matching */}
              <div>
                <label
                  htmlFor="addonTextureMatch"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Texture Matching
                  <span className="text-gray-400 font-normal ml-1">flat</span>
                </label>
                <input
                  id="addonTextureMatch"
                  type="number"
                  value={addonTextureMatch}
                  onChange={(e) =>
                    setAddonTextureMatch(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={1}
                  placeholder={String(getDefaultAddonPrice("texture_match"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("texture_match")}
                </p>
              </div>

              {/* High Ceiling Premium */}
              <div>
                <label
                  htmlFor="addonHighCeiling"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  High Ceiling Premium
                  <span className="text-gray-400 font-normal ml-1">$/sqft</span>
                </label>
                <input
                  id="addonHighCeiling"
                  type="number"
                  value={addonHighCeiling}
                  onChange={(e) =>
                    setAddonHighCeiling(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder={String(getDefaultAddonPrice("high_ceiling"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("high_ceiling")}/sqft
                </p>
              </div>

              {/* Dust Barrier Setup */}
              <div>
                <label
                  htmlFor="addonDustBarrier"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Dust Barrier Setup
                  <span className="text-gray-400 font-normal ml-1">flat</span>
                </label>
                <input
                  id="addonDustBarrier"
                  type="number"
                  value={addonDustBarrier}
                  onChange={(e) =>
                    setAddonDustBarrier(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={1}
                  placeholder={String(getDefaultAddonPrice("dust_barrier"))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Default: ${getDefaultAddonPrice("dust_barrier")}
                </p>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              )}
            >
              {isSaving ? (
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
      </div>
    </Layout>
  );
}
