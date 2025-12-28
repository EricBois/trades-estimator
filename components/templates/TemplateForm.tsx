"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks";
import { TRADE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RequiredField {
  key: string;
  type: "text" | "number" | "select" | "textarea";
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Text Area" },
] as const;

interface TemplateData {
  templateName: string;
  tradeType: string;
  description: string | null;
  baseLaborHours: number;
  baseMaterialCost: number;
  requiredFields: Record<string, unknown> | null;
}

interface TemplateFormProps {
  templateId?: string;
  initialData?: TemplateData;
}

export function TemplateForm({ templateId, initialData }: TemplateFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const isEditMode = !!templateId;

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  // Parse initial required fields
  const initialRequiredFields: RequiredField[] = initialData?.requiredFields
    ? Object.entries(initialData.requiredFields).map(([key, value]) => ({
        key,
        ...(value as Omit<RequiredField, "key">),
      }))
    : [];

  // Form state
  const [templateName, setTemplateName] = useState(initialData?.templateName ?? "");
  const [tradeType, setTradeType] = useState(initialData?.tradeType ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [baseLaborHours, setBaseLaborHours] = useState<number | "">(
    initialData?.baseLaborHours ?? ""
  );
  const [baseMaterialCost, setBaseMaterialCost] = useState<number | "">(
    initialData?.baseMaterialCost ?? ""
  );
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>(initialRequiredFields);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const addField = () => {
    const newKey = `field_${Date.now()}`;
    setRequiredFields((prev) => [
      ...prev,
      { key: newKey, type: "text", label: "" },
    ]);
  };

  const updateField = (index: number, updates: Partial<RequiredField>) => {
    setRequiredFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...updates } : field))
    );
  };

  const removeField = (index: number) => {
    setRequiredFields((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex: number) => {
    setRequiredFields((prev) =>
      prev.map((field, i) =>
        i === fieldIndex
          ? {
              ...field,
              options: [...(field.options ?? []), { value: "", label: "" }],
            }
          : field
      )
    );
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    updates: { value?: string; label?: string }
  ) => {
    setRequiredFields((prev) =>
      prev.map((field, i) =>
        i === fieldIndex
          ? {
              ...field,
              options: field.options?.map((opt, j) =>
                j === optionIndex ? { ...opt, ...updates } : opt
              ),
            }
          : field
      )
    );
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setRequiredFields((prev) =>
      prev.map((field, i) =>
        i === fieldIndex
          ? {
              ...field,
              options: field.options?.filter((_, j) => j !== optionIndex),
            }
          : field
      )
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!templateName.trim()) {
      newErrors.templateName = "Template name is required";
    }
    if (!tradeType) {
      newErrors.tradeType = "Trade type is required";
    }
    if (baseLaborHours === "" || baseLaborHours < 0) {
      newErrors.baseLaborHours = "Base labor hours must be 0 or more";
    }
    if (baseMaterialCost === "" || baseMaterialCost < 0) {
      newErrors.baseMaterialCost = "Base material cost must be 0 or more";
    }

    // Validate required fields
    requiredFields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = "Field label is required";
      }
      if (field.type === "select" && (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = "Dropdown needs at least one option";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !profile) return;

    setIsSaving(true);

    try {
      // Convert required fields array to object
      const requiredFieldsObj = requiredFields.reduce(
        (acc, field) => {
          const { key, ...fieldData } = field;
          // Clean up empty options
          if (fieldData.type !== "select") {
            delete fieldData.options;
          }
          // Generate a clean key from label if key is auto-generated
          const cleanKey = key.startsWith("field_")
            ? field.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
            : key;
          acc[cleanKey] = fieldData;
          return acc;
        },
        {} as Record<string, Omit<RequiredField, "key">>
      );

      const templateData = {
        templateName: templateName.trim(),
        tradeType,
        description: description.trim() || undefined,
        baseLaborHours: baseLaborHours as number,
        baseMaterialCost: baseMaterialCost as number,
        requiredFields: Object.keys(requiredFieldsObj).length > 0 ? requiredFieldsObj : undefined,
      };

      if (isEditMode && templateId) {
        await updateTemplate.mutateAsync({ id: templateId, ...templateData });
      } else {
        await createTemplate.mutateAsync({
          contractorId: profile.id,
          ...templateData,
        });
      }

      router.push("/templates");
    } catch (error) {
      console.error("Failed to save template:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to save template",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to templates
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Template" : "Create Template"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <div>
              <label
                htmlFor="templateName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Template Name
              </label>
              <input
                id="templateName"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Bathroom Remodel"
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.templateName ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.templateName && (
                <p className="mt-1 text-sm text-red-600">{errors.templateName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="tradeType"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Trade Type
              </label>
              <select
                id="tradeType"
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm bg-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.tradeType ? "border-red-300" : "border-gray-300"
                )}
              >
                <option value="">Select trade type...</option>
                {TRADE_TYPES.map((trade) => (
                  <option key={trade.value} value={trade.value}>
                    {trade.label}
                  </option>
                ))}
              </select>
              {errors.tradeType && (
                <p className="mt-1 text-sm text-red-600">{errors.tradeType}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this template..."
                rows={2}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Base Pricing
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="baseLaborHours"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Base Labor Hours
                </label>
                <input
                  id="baseLaborHours"
                  type="number"
                  value={baseLaborHours}
                  onChange={(e) =>
                    setBaseLaborHours(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.5}
                  placeholder="8"
                  className={cn(
                    "block w-full px-4 py-3 border rounded-lg shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.baseLaborHours ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.baseLaborHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseLaborHours}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="baseMaterialCost"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Base Material Cost ($)
                </label>
                <input
                  id="baseMaterialCost"
                  type="number"
                  value={baseMaterialCost}
                  onChange={(e) =>
                    setBaseMaterialCost(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  min={0}
                  step={0.01}
                  placeholder="150"
                  className={cn(
                    "block w-full px-4 py-3 border rounded-lg shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    errors.baseMaterialCost ? "border-red-300" : "border-gray-300"
                  )}
                />
                {errors.baseMaterialCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseMaterialCost}</p>
                )}
              </div>
            </div>
          </section>

          {/* Required Fields Builder */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Required Fields
                </h2>
                <p className="text-sm text-gray-500">
                  Fields the user must fill when creating an estimate
                </p>
              </div>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            {requiredFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No required fields yet.</p>
                <p className="text-sm">Click &quot;Add Field&quot; to add input fields for estimates.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requiredFields.map((field, index) => (
                  <div
                    key={field.key}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400 mt-3">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) =>
                              updateField(index, { label: e.target.value })
                            }
                            placeholder="e.g., Square Footage"
                            className={cn(
                              "block w-full px-3 py-2 border rounded-lg text-sm",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500",
                              errors[`field_${index}_label`]
                                ? "border-red-300"
                                : "border-gray-300"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, {
                                type: e.target.value as RequiredField["type"],
                                options: e.target.value === "select" ? [] : undefined,
                              })
                            }
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Number field options */}
                    {field.type === "number" && (
                      <div className="grid grid-cols-3 gap-3 pl-7">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Min
                          </label>
                          <input
                            type="number"
                            value={field.min ?? ""}
                            onChange={(e) =>
                              updateField(index, {
                                min: e.target.value === "" ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder="0"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Max
                          </label>
                          <input
                            type="number"
                            value={field.max ?? ""}
                            onChange={(e) =>
                              updateField(index, {
                                max: e.target.value === "" ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder="1000"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            value={field.unit ?? ""}
                            onChange={(e) =>
                              updateField(index, { unit: e.target.value || undefined })
                            }
                            placeholder="sq ft"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Select field options */}
                    {field.type === "select" && (
                      <div className="pl-7 space-y-2">
                        <label className="block text-xs font-medium text-gray-500">
                          Options
                        </label>
                        {errors[`field_${index}_options`] && (
                          <p className="text-sm text-red-600">
                            {errors[`field_${index}_options`]}
                          </p>
                        )}
                        {field.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                updateOption(index, optIndex, { value: e.target.value })
                              }
                              placeholder="Value"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) =>
                                updateOption(index, optIndex, { label: e.target.value })
                              }
                              placeholder="Display Label"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(index, optIndex)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(index)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    {/* Placeholder for text/textarea */}
                    {(field.type === "text" || field.type === "textarea") && (
                      <div className="pl-7">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Placeholder (optional)
                        </label>
                        <input
                          type="text"
                          value={field.placeholder ?? ""}
                          onChange={(e) =>
                            updateField(index, { placeholder: e.target.value || undefined })
                          }
                          placeholder="Enter placeholder text..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
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
                  {isEditMode ? "Save Changes" : "Create Template"}
                </>
              )}
            </button>
            <Link
              href="/templates"
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
