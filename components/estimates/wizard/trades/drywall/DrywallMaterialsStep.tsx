"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import {
  Plus,
  Minus,
  Trash2,
  Paintbrush,
  Package,
  CornerDownRight,
  ChevronDown,
  Star,
} from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import {
  FINISHING_MATERIAL_CATEGORIES,
  FINISHING_MUD_TYPES,
  FINISHING_TAPE_TYPES,
  FINISHING_CORNER_BEAD_TYPES,
  FINISHING_OTHER_MATERIALS,
} from "@/lib/trades/drywallFinishing/constants";
import {
  FinishingMaterialId,
  FinishingMaterialCategory,
} from "@/lib/trades/drywallFinishing/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { InlineOverrideInput } from "@/components/ui/InlineOverrideInput";
import { useContractorMaterials } from "@/hooks/useContractorMaterials";

// Icon mapping for categories
const CategoryIcon = ({
  category,
}: {
  category: FinishingMaterialCategory;
}) => {
  switch (category) {
    case "mud":
      return <Paintbrush className="w-5 h-5" />;
    case "tape":
      return <Minus className="w-5 h-5" />;
    case "corner_bead":
      return <CornerDownRight className="w-5 h-5" />;
    case "other":
      return <Package className="w-5 h-5" />;
    default:
      return <Package className="w-5 h-5" />;
  }
};

// Get materials by category
function getMaterialsByCategory(category: FinishingMaterialCategory) {
  switch (category) {
    case "mud":
      return FINISHING_MUD_TYPES;
    case "tape":
      return FINISHING_TAPE_TYPES;
    case "corner_bead":
      return FINISHING_CORNER_BEAD_TYPES;
    case "other":
      return FINISHING_OTHER_MATERIALS;
    default:
      return [];
  }
}

// Map database category to finishing category
function mapToFinishingCategory(dbCategory: string): FinishingMaterialCategory {
  if (dbCategory === "primer") return "other";
  return dbCategory as FinishingMaterialCategory;
}

export function DrywallMaterialsStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    materials,
    addMaterial,
    addCustomMaterial,
    updateMaterial,
    removeMaterial,
    setMaterialPriceOverride,
    totals,
  } = useDrywallEstimate();

  // Fetch custom materials
  const { data: customMaterials = [] } = useContractorMaterials();

  // Track which category is expanded
  const [expandedCategory, setExpandedCategory] =
    useState<FinishingMaterialCategory | null>(null);

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: materials.length === 0 ? "Skip" : "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, materials.length]);

  const handleAddMaterial = (materialId: FinishingMaterialId) => {
    addMaterial(materialId, 1);
    setExpandedCategory(null);
  };

  const handleAddCustomMaterial = (material: {
    id: string;
    name: string;
    category: string;
    unit: string;
    basePrice: number;
  }) => {
    addCustomMaterial(
      material.id,
      material.name,
      mapToFinishingCategory(material.category),
      material.unit,
      material.basePrice,
      1
    );
    setExpandedCategory(null);
  };

  // Get custom materials for a category
  const getCustomMaterialsForCategory = (
    category: FinishingMaterialCategory
  ) => {
    return customMaterials.filter((m) => {
      const mappedCategory = mapToFinishingCategory(m.category);
      return mappedCategory === category;
    });
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const entry = materials.find((m) => m.id === id);
    if (!entry) return;
    const newQty = entry.quantity + delta;
    if (newQty <= 0) {
      removeMaterial(id);
      return;
    }
    updateMaterial(id, { quantity: newQty });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Materials
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Add specific materials (optional)
      </p>

      {/* Added materials list */}
      {materials.length > 0 && (
        <div className="space-y-3 mb-6">
          {materials.map((entry) => {
            return (
              <div
                key={entry.id}
                className="bg-white border-2 border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        entry.isCustom
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      )}
                    >
                      {entry.isCustom ? (
                        <Star className="w-5 h-5" />
                      ) : (
                        <CategoryIcon category={entry.category} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-1.5">
                        {entry.name}
                        {entry.isCustom && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{entry.unit}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMaterial(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Quantity and price controls */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(entry.id, -1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={entry.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          updateMaterial(entry.id, { quantity: val });
                        }
                      }}
                      className="w-16 text-center text-lg font-semibold text-gray-900 border-2 border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(entry.id, 1)}
                      className="w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                      <InlineOverrideInput
                        value={entry.priceOverride ?? entry.unitPrice}
                        defaultValue={entry.unitPrice}
                        override={entry.priceOverride}
                        onOverrideChange={(override) =>
                          setMaterialPriceOverride(entry.id, override)
                        }
                        prefix="$"
                        suffix={`/${entry.unit}`}
                      />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${formatCurrency(entry.subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add material categories */}
      <div className="space-y-3">
        {FINISHING_MATERIAL_CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const categoryMaterials = getMaterialsByCategory(
            category.id as FinishingMaterialCategory
          );
          const categoryCustomMaterials = getCustomMaterialsForCategory(
            category.id as FinishingMaterialCategory
          );
          const totalOptions =
            categoryMaterials.length + categoryCustomMaterials.length;

          return (
            <div
              key={category.id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedCategory(
                    isExpanded
                      ? null
                      : (category.id as FinishingMaterialCategory)
                  )
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <CategoryIcon
                      category={category.id as FinishingMaterialCategory}
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {category.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalOptions} options
                      {categoryCustomMaterials.length > 0 && (
                        <span className="text-amber-600 ml-1">
                          ({categoryCustomMaterials.length} custom)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-3 space-y-2">
                  {/* Custom materials first (highlighted) */}
                  {categoryCustomMaterials.length > 0 && (
                    <>
                      <div className="text-xs font-medium text-amber-600 uppercase tracking-wide px-2 pb-1">
                        Your Materials
                      </div>
                      {categoryCustomMaterials.map((material) => (
                        <button
                          key={material.id}
                          onClick={() =>
                            handleAddCustomMaterial({
                              id: material.id,
                              name: material.name,
                              category: material.category,
                              unit: material.unit,
                              basePrice: material.basePrice,
                            })
                          }
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <div className="text-left flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {material.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {material.unitSize} {material.unit}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              ${material.basePrice.toFixed(2)}/{material.unit}
                            </span>
                            <Plus className="w-5 h-5 text-amber-600" />
                          </div>
                        </button>
                      ))}
                      {categoryMaterials.length > 0 && (
                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 pb-1 pt-2">
                          Standard Materials
                        </div>
                      )}
                    </>
                  )}
                  {/* Preset materials */}
                  {categoryMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() =>
                        handleAddMaterial(material.id as FinishingMaterialId)
                      }
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {material.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {material.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          ${material.price.toFixed(2)}/{material.unit}
                        </span>
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Materials Summary */}
      {materials.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
          <span className="text-sm text-blue-600">Materials: </span>
          <span className="text-lg font-bold text-blue-900">
            +${formatCurrency(totals.materialsSubtotal)}
          </span>
        </div>
      )}
    </div>
  );
}
