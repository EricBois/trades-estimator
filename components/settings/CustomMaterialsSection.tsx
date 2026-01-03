"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  Star,
} from "lucide-react";
import {
  useContractorMaterialsByTrade,
  useCreateContractorMaterial,
  useUpdateContractorMaterial,
  useDeleteContractorMaterial,
  TRADE_MATERIAL_CATEGORIES,
  MaterialCategory,
  Trade,
} from "@/hooks/useContractorMaterials";
import { cn } from "@/lib/utils";
import { SettingsSection } from "@/components/ui/SettingsSection";

interface CustomMaterialsSectionProps {
  trade: Trade;
}

interface MaterialFormData {
  name: string;
  category: MaterialCategory;
  unit: string;
  unitSize: string;
  basePrice: string;
  description: string;
}

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  // Drywall Finishing
  mud: "Mud/Compound",
  tape: "Tape",
  corner_bead: "Corner Bead",
  primer: "Primer",
  // Drywall Hanging
  board: "Drywall Board",
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
  other: "Other",
};

const COMMON_UNITS = [
  "box",
  "roll",
  "gallon",
  "pail",
  "bag",
  "piece",
  "sheet",
  "linear ft",
  "sqft",
  "tube",
];

export function CustomMaterialsSection({ trade }: CustomMaterialsSectionProps) {
  const { data: materials = [], isLoading } = useContractorMaterialsByTrade(
    trade,
    false
  );
  const tradeCategories = TRADE_MATERIAL_CATEGORIES[trade];
  const defaultCategory = tradeCategories[0] as MaterialCategory;
  const createMaterial = useCreateContractorMaterial();
  const updateMaterial = useUpdateContractorMaterial();
  const deleteMaterial = useDeleteContractorMaterial();

  const getDefaultFormData = (): MaterialFormData => ({
    name: "",
    category: defaultCategory,
    unit: "box",
    unitSize: "",
    basePrice: "",
    description: "",
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(
    getDefaultFormData()
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!formData.name || !formData.basePrice) return;

    await createMaterial.mutateAsync({
      name: formData.name,
      trade: trade,
      category: formData.category,
      unit: formData.unit,
      unitSize: formData.unitSize || null,
      basePrice: parseFloat(formData.basePrice),
      description: formData.description || null,
    });

    setFormData(getDefaultFormData());
    setIsAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name || !formData.basePrice) return;

    await updateMaterial.mutateAsync({
      id,
      name: formData.name,
      trade: trade,
      category: formData.category,
      unit: formData.unit,
      unitSize: formData.unitSize || null,
      basePrice: parseFloat(formData.basePrice),
      description: formData.description || null,
    });

    setFormData(getDefaultFormData());
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    console.log("handleDelete called with id:", id);
    try {
      console.log("Calling deleteMaterial.mutateAsync...");
      await deleteMaterial.mutateAsync(id);
      console.log("Delete successful");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete material:", error);
      // Reset the confirm state even on error
      setDeleteConfirmId(null);
    }
  };

  const startEdit = (material: (typeof materials)[0]) => {
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      unitSize: material.unitSize || "",
      basePrice: material.basePrice.toString(),
      description: material.description || "",
    });
    setEditingId(material.id);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setFormData(getDefaultFormData());
    setEditingId(null);
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <SettingsSection
        icon={Package}
        title="Custom Materials"
        description="Your saved materials for quick access in estimates"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      icon={Package}
      title="Custom Materials"
      description="Your saved materials for quick access in estimates"
    >
      {/* Materials list */}
      {materials.length > 0 && (
        <div className="space-y-3 mb-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className={cn(
                "border rounded-lg p-4",
                material.isActive
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50 opacity-60"
              )}
            >
              {editingId === material.id ? (
                // Edit form
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Material name"
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as MaterialCategory,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {tradeCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat] || cat}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unit: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {COMMON_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.unitSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unitSize: e.target.value,
                        }))
                      }
                      placeholder="Size (e.g., 4.5 gal)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            basePrice: e.target.value,
                          }))
                        }
                        placeholder="Price"
                        step="0.01"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(material.id)}
                      disabled={updateMaterial.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {updateMaterial.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              ) : deleteConfirmId === material.id ? (
                // Delete confirmation
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium">
                    Delete &quot;{material.name}&quot;?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(material.id)}
                      disabled={deleteMaterial.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {deleteMaterial.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {material.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {CATEGORY_LABELS[material.category]} &bull;{" "}
                        {material.unitSize && `${material.unitSize} `}
                        {material.unit} &bull; ${material.basePrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(material)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(material.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new material form */}
      {isAdding ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Material name *"
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as MaterialCategory,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tradeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formData.unitSize}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unitSize: e.target.value }))
                }
                placeholder="Size (e.g., 4.5 gal)"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      basePrice: e.target.value,
                    }))
                  }
                  placeholder="Price *"
                  step="0.01"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={
                  !formData.name ||
                  !formData.basePrice ||
                  createMaterial.isPending
                }
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMaterial.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Material
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData(getDefaultFormData());
          }}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Custom Material
        </button>
      )}

      {materials.length === 0 && !isAdding && (
        <p className="text-center text-sm text-gray-500 mt-3">
          No custom materials yet. Add your commonly used materials for quick
          access in estimates.
        </p>
      )}
    </SettingsSection>
  );
}
