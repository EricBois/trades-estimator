"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRADE_TYPES } from "@/lib/constants";
import type { Template } from "@/hooks";
import type { TemplateCustomization } from "@/hooks";

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

interface TemplateCustomizeModalProps {
  template: Template;
  customizations: TemplateCustomization;
  onSave: (customizations: TemplateCustomization) => void;
  onClose: () => void;
}

export function TemplateCustomizeModal({
  template,
  customizations,
  onSave,
  onClose,
}: TemplateCustomizeModalProps) {
  // Parse initial required fields from template or customizations
  const parseRequiredFields = (fields: Record<string, unknown> | null | undefined): RequiredField[] => {
    if (!fields) return [];
    return Object.entries(fields).map(([key, value]) => ({
      key,
      ...(value as Omit<RequiredField, "key">),
    }));
  };

  // Form state - prioritize customizations over original template
  const [templateName, setTemplateName] = useState(
    customizations.templateName ?? template.templateName
  );
  const [tradeType, setTradeType] = useState(
    customizations.tradeType ?? template.tradeType
  );
  const [description, setDescription] = useState(
    customizations.description !== undefined
      ? customizations.description ?? ""
      : template.description ?? ""
  );
  const [baseLaborHours, setBaseLaborHours] = useState<number | "">(
    customizations.baseLaborHours ?? template.baseLaborHours
  );
  const [baseMaterialCost, setBaseMaterialCost] = useState<number | "">(
    customizations.baseMaterialCost ?? template.baseMaterialCost
  );
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>(
    parseRequiredFields(customizations.requiredFields ?? template.requiredFields)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

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

  const handleSave = () => {
    if (!validate()) return;

    // Convert required fields array to object
    const requiredFieldsObj = requiredFields.reduce(
      (acc, field) => {
        const { key, ...fieldData } = field;
        if (fieldData.type !== "select") {
          delete fieldData.options;
        }
        const cleanKey = key.startsWith("field_")
          ? field.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
          : key;
        acc[cleanKey] = fieldData;
        return acc;
      },
      {} as Record<string, Omit<RequiredField, "key">>
    );

    const customization: TemplateCustomization = {
      templateName: templateName.trim(),
      tradeType,
      description: description.trim() || null,
      baseLaborHours: baseLaborHours as number,
      baseMaterialCost: baseMaterialCost as number,
      requiredFields: Object.keys(requiredFieldsObj).length > 0 ? requiredFieldsObj : null,
    };

    onSave(customization);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Customize Template
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5 sm:space-y-6">
            {/* Basic Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Basic Information
              </h3>

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
                  rows={2}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </section>

            {/* Pricing */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Base Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Required Fields */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Required Fields
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Fields users must fill when creating estimates
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
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-sm">No required fields yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requiredFields.map((field, index) => (
                    <div
                      key={field.key}
                      className="border border-gray-200 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-gray-400 mt-2">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Label
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
                              Type
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
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Number field options */}
                      {field.type === "number" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6">
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
                              className="block w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              className="block w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              className="block w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Select field options */}
                      {field.type === "select" && (
                        <div className="pl-6 space-y-2">
                          <label className="block text-xs font-medium text-gray-500">
                            Options
                          </label>
                          {errors[`field_${index}_options`] && (
                            <p className="text-xs text-red-600">
                              {errors[`field_${index}_options`]}
                            </p>
                          )}
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) =>
                                  updateOption(index, optIndex, { value: e.target.value })
                                }
                                placeholder="Value"
                                className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) =>
                                  updateOption(index, optIndex, { label: e.target.value })
                                }
                                placeholder="Label"
                                className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, optIndex)}
                                className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 rounded self-end sm:self-auto"
                              >
                                <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
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
                        <div className="pl-6">
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
                            className="block w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Customizations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
