"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Clock, FileText, Loader2, DollarSign } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { useTemplates } from "@/hooks/useTemplates";
import { DEFAULT_WIZARD_TEMPLATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Template interface that combines DB templates and default templates
interface WizardTemplate {
  id: string;
  templateName: string;
  tradeType: string;
  pricingType?: string;
  description: string | null;
  baseLaborHours: number;
  baseMaterialCost: number;
  complexityMultipliers: Record<string, number> | null;
  requiredFields: Record<string, unknown> | null;
  isDefault?: boolean;
}

const PRICING_TYPE_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  hourly: { bg: "bg-green-100", text: "text-green-700", label: "Hourly" },
  contract: { bg: "bg-blue-100", text: "text-blue-700", label: "Contract" },
  hybrid: { bg: "bg-purple-100", text: "text-purple-700", label: "Hybrid" },
};

export function TemplateStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { tradeType, setTemplate } = useWizardData();
  const { data: userTemplates, isLoading } = useTemplates();

  // Configure footer (Continue is disabled since user must select a template)
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: true, // Selecting a template auto-navigates
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  // Combine user templates with default templates for the selected trade
  const availableTemplates = useMemo(() => {
    const templates: WizardTemplate[] = [];

    // Add user's templates for this trade
    const userTradeTemplates =
      userTemplates?.filter((t) => t.tradeType === tradeType) ?? [];

    templates.push(
      ...userTradeTemplates.map((t) => ({
        ...t,
        pricingType: "contract", // Default pricing type for existing templates
        isDefault: false,
      }))
    );

    // Add default templates for this trade (if user has none)
    if (userTradeTemplates.length === 0) {
      const defaultTradeTemplates = DEFAULT_WIZARD_TEMPLATES.filter(
        (t) => t.tradeType === tradeType
      );
      templates.push(
        ...defaultTradeTemplates.map((t) => ({
          ...t,
          description: t.description,
          complexityMultipliers: ("complexityMultipliers" in t
            ? t.complexityMultipliers
            : null) as Record<string, number> | null,
          requiredFields: t.requiredFields as Record<string, unknown>,
          isDefault: true,
        }))
      );
    }

    return templates;
  }, [userTemplates, tradeType]);

  const handleSelect = (template: WizardTemplate) => {
    setTemplate({
      id: template.id,
      contractorId: null,
      templateName: template.templateName,
      tradeType: template.tradeType,
      description: template.description,
      baseLaborHours: template.baseLaborHours,
      baseMaterialCost: template.baseMaterialCost,
      complexityMultipliers: template.complexityMultipliers,
      requiredFields: template.requiredFields,
    });
    nextStep();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        What kind of work?
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Select a pricing template
      </p>

      {availableTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No templates available</p>
          <p className="text-sm text-gray-400">
            Create templates in the Templates section first
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableTemplates.map((template) => {
            const pricingStyle =
              PRICING_TYPE_STYLES[template.pricingType ?? "contract"];

            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  "w-full flex items-start gap-4 p-5",
                  "bg-white border-2 border-gray-200 rounded-xl",
                  "hover:border-blue-500 hover:bg-blue-50",
                  "active:scale-[0.99] transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "text-left"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    template.pricingType === "hourly"
                      ? "bg-green-100"
                      : "bg-blue-100"
                  )}
                >
                  {template.pricingType === "hourly" ? (
                    <Clock className="w-5 h-5 text-green-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-medium text-gray-900">
                      {template.templateName}
                    </h3>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        pricingStyle.bg,
                        pricingStyle.text
                      )}
                    >
                      {pricingStyle.label}
                    </span>
                    {template.isDefault && (
                      <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
