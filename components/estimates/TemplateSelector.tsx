"use client";

import { useMemo } from "react";
import { FileText, Info } from "lucide-react";
import { useTemplates } from "@/hooks";
import { cn } from "@/lib/utils";

interface RequiredField {
  type: "text" | "number" | "select" | "textarea";
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onTemplateChange: (templateId: string | null) => void;
  className?: string;
}

export function TemplateSelector({
  selectedTemplateId,
  onTemplateChange,
  className,
}: TemplateSelectorProps) {
  const { data: templates, isLoading } = useTemplates();

  // Get unique trade types from templates
  const tradeTypes = useMemo(() => {
    if (!templates) return [];
    const types = [...new Set(templates.map((t) => t.tradeType))];
    return types.sort();
  }, [templates]);

  // Group templates by trade type
  const templatesByTrade = useMemo(() => {
    if (!templates) return {};
    return templates.reduce(
      (acc, template) => {
        const trade = template.tradeType;
        if (!acc[trade]) acc[trade] = [];
        acc[trade].push(template);
        return acc;
      },
      {} as Record<string, typeof templates>
    );
  }, [templates]);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || !templates) return null;
    return templates.find((t) => t.id === selectedTemplateId) ?? null;
  }, [selectedTemplateId, templates]);

  const requiredFields = useMemo(() => {
    if (!selectedTemplate?.requiredFields) return [];
    const fields = selectedTemplate.requiredFields as Record<
      string,
      RequiredField
    >;
    return Object.entries(fields).map(([key, field]) => ({
      key,
      ...field,
    }));
  }, [selectedTemplate]);

  // Format trade type for display
  const formatTradeType = (trade: string) => {
    return trade.charAt(0).toUpperCase() + trade.slice(1);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Template Selector with optgroup */}
      <div>
        <label
          htmlFor="template"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Select Template
        </label>
        <select
          id="template"
          value={selectedTemplateId ?? ""}
          onChange={(e) => onTemplateChange(e.target.value || null)}
          disabled={isLoading}
          className={cn(
            "block w-full px-4 py-3 border rounded-lg shadow-sm transition-shadow bg-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "border-gray-300",
            isLoading && "opacity-50"
          )}
        >
          <option value="">
            {isLoading ? "Loading templates..." : "Select a template..."}
          </option>
          {tradeTypes.map((trade) => (
            <optgroup key={trade} label={formatTradeType(trade)}>
              {templatesByTrade[trade]?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.templateName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!isLoading && (!templates || templates.length === 0) && (
          <p className="mt-1.5 text-sm text-gray-500">
            No templates available. Create one in the Templates section.
          </p>
        )}
      </div>

      {/* Template Description */}
      {selectedTemplate && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">
                {selectedTemplate.templateName}
              </h4>
              {selectedTemplate.description && (
                <p className="text-sm text-blue-700">
                  {selectedTemplate.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-blue-600">
                <span>
                  Base Labor: {selectedTemplate.baseLaborHours} hrs
                </span>
                <span>
                  Base Materials: ${selectedTemplate.baseMaterialCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Fields Preview */}
      {requiredFields.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">
                Required Information
              </h4>
              <p className="text-sm text-gray-600">
                This template requires the following details:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                {requiredFields.map((field) => (
                  <li key={field.key}>
                    {field.label}
                    {field.unit && (
                      <span className="text-gray-400"> ({field.unit})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
