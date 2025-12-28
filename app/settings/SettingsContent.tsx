"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, Save, Loader2, Building2, DollarSign } from "lucide-react";
import { Layout } from "@/components/layout";
import { useUpdateProfile } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SettingsContentProps {
  profile: {
    id: string;
    companyName: string | null;
    hourlyRate: number | null;
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

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        companyName,
        hourlyRate: hourlyRate === "" ? null : hourlyRate,
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
