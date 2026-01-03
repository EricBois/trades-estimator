"use client";

import { useState, useMemo } from "react";
import { DollarSign, RotateCcw, Loader2, ChevronDown } from "lucide-react";
import {
  usePresetsWithOverridesByTrade,
  useSetPresetOverride,
  useRemovePresetOverride,
  ContractorMaterial,
  Trade,
  TRADE_MATERIAL_CATEGORIES,
} from "@/hooks/useContractorMaterials";
import { cn } from "@/lib/utils";
import { SettingsSection } from "@/components/ui/SettingsSection";

interface PresetMaterialPricesSectionProps {
  trade: Trade;
}

// Category labels for UI (all trades)
const CATEGORY_LABELS: Record<string, string> = {
  // Drywall Finishing
  mud: "Joint Compound",
  tape: "Tape",
  corner_bead: "Corner Bead",
  primer: "Primer",
  // Drywall Hanging
  board: "Drywall Boards",
  fastener: "Fasteners",
  trim: "Trim/Bead",
  insulation: "Insulation",
  // Painting
  paint: "Paint",
  supplies: "Supplies",
  // Framing
  lumber: "Lumber",
  hardware: "Hardware",
  // Common
  other: "Other Materials",
};

export function PresetMaterialPricesSection({
  trade,
}: PresetMaterialPricesSectionProps) {
  const { data, isLoading } = usePresetsWithOverridesByTrade(trade);
  const setOverride = useSetPresetOverride();
  const removeOverride = useRemovePresetOverride();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const presets = data?.presets ?? [];
  const overrides = data?.overrides ?? new Map<string, ContractorMaterial>();

  // Group materials by category
  const materialsByCategory = useMemo(() => {
    const grouped: Record<string, ContractorMaterial[]> = {};
    for (const material of presets) {
      if (!grouped[material.category]) {
        grouped[material.category] = [];
      }
      grouped[material.category].push(material);
    }
    return grouped;
  }, [presets]);

  // Get categories that have materials, in order based on trade
  const tradeCategories = TRADE_MATERIAL_CATEGORIES[trade];
  const categories = useMemo(() => {
    return tradeCategories.filter(
      (cat) => materialsByCategory[cat]?.length > 0
    );
  }, [materialsByCategory, tradeCategories]);

  const handleSaveOverride = async (presetId: string) => {
    const price = parseFloat(editValue);
    if (isNaN(price) || price <= 0) return;

    await setOverride.mutateAsync({ presetId, price });
    setEditingId(null);
    setEditValue("");
  };

  const handleRemoveOverride = async (presetId: string) => {
    await removeOverride.mutateAsync(presetId);
  };

  const startEdit = (preset: ContractorMaterial) => {
    const override = overrides.get(preset.id);
    setEditingId(preset.id);
    setEditValue(
      override ? override.basePrice.toString() : preset.basePrice.toString()
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  if (isLoading) {
    return (
      <SettingsSection
        icon={DollarSign}
        title="Preset Material Prices"
        description="Override default prices for standard materials"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </SettingsSection>
    );
  }

  if (presets.length === 0) {
    return (
      <SettingsSection
        icon={DollarSign}
        title="Preset Material Prices"
        description="Override default prices for standard materials"
      >
        <p className="text-sm text-gray-500 text-center py-4">
          No preset materials found. Run the database migration to seed preset
          materials.
        </p>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      icon={DollarSign}
      title="Preset Material Prices"
      description="Override default prices for standard materials"
    >
      <div className="space-y-3">
        {categories.map((categoryId) => {
          const isExpanded = expandedCategory === categoryId;
          const materials = materialsByCategory[categoryId] || [];

          return (
            <div
              key={categoryId}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : categoryId)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  {CATEGORY_LABELS[categoryId] || categoryId}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50">
                  {materials.map((preset) => {
                    const override = overrides.get(preset.id);
                    const hasOverride = !!override;
                    const displayPrice = hasOverride
                      ? override.basePrice
                      : preset.basePrice;
                    const isEditing = editingId === preset.id;

                    return (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {preset.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Default: ${preset.basePrice.toFixed(2)}/
                            {preset.unit}
                            {preset.unitSize && ` (${preset.unitSize})`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleSaveOverride(preset.id);
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                  step="0.01"
                                  autoFocus
                                  className="w-24 pl-6 pr-2 py-1.5 text-sm border border-blue-300 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSaveOverride(preset.id)}
                                disabled={setOverride.isPending}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {setOverride.isPending ? "..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(preset)}
                                className={cn(
                                  "w-24 pl-6 pr-2 py-1.5 text-sm border rounded-lg text-left cursor-pointer hover:border-blue-400 transition-colors",
                                  hasOverride
                                    ? "border-blue-300 bg-blue-50 font-medium"
                                    : "border-gray-300 bg-white text-gray-500"
                                )}
                              >
                                ${displayPrice.toFixed(2)}
                              </button>
                              {hasOverride && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOverride(preset.id)
                                  }
                                  disabled={removeOverride.isPending}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                  title="Reset to default"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
