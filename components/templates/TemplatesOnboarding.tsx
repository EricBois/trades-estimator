"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { OnboardingTemplateCard } from "./OnboardingTemplateCard";
import { TemplateCustomizeModal } from "./TemplateCustomizeModal";
import { useCompleteOnboarding, useSkipOnboarding } from "@/hooks";
import type { Template, TemplateCustomization } from "@/hooks";
import { TRADE_TYPES } from "@/lib/constants";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplatesOnboardingProps {
  defaultTemplates: Template[];
  profileId: string;
}

export function TemplatesOnboarding({
  defaultTemplates,
  profileId,
}: TemplatesOnboardingProps) {
  const router = useRouter();
  const completeOnboarding = useCompleteOnboarding();
  const skipOnboarding = useSkipOnboarding();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customizations, setCustomizations] = useState<Record<string, TemplateCustomization>>({});
  const [customizingTemplate, setCustomizingTemplate] = useState<Template | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  // Get unique trade types from templates
  const tradeTypes = useMemo(() => {
    const types = [...new Set(defaultTemplates.map((t) => t.tradeType))];
    return types.sort();
  }, [defaultTemplates]);

  // Filter templates by selected trade
  const filteredTemplates = useMemo(() => {
    if (!selectedTrade) return defaultTemplates;
    return defaultTemplates.filter((t) => t.tradeType === selectedTrade);
  }, [defaultTemplates, selectedTrade]);

  // Group templates by trade type
  const templatesByTrade = useMemo(() => {
    return filteredTemplates.reduce(
      (acc, template) => {
        const trade = template.tradeType;
        if (!acc[trade]) acc[trade] = [];
        acc[trade].push(template);
        return acc;
      },
      {} as Record<string, Template[]>
    );
  }, [filteredTemplates]);

  const formatTradeType = (trade: string) => {
    const found = TRADE_TYPES.find((t) => t.value === trade);
    return found?.label ?? trade.charAt(0).toUpperCase() + trade.slice(1);
  };

  const handleToggleSelect = (templateId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
      // Also remove customizations
      const newCustomizations = { ...customizations };
      delete newCustomizations[templateId];
      setCustomizations(newCustomizations);
    } else {
      newSelected.add(templateId);
    }
    setSelectedIds(newSelected);
  };

  const handleSaveCustomization = (templateId: string, data: TemplateCustomization) => {
    setCustomizations((prev) => ({ ...prev, [templateId]: data }));
    setCustomizingTemplate(null);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const selectedTemplates = defaultTemplates
        .filter((t) => selectedIds.has(t.id))
        .map((t) => ({
          originalTemplate: t,
          customizations: customizations[t.id] || {},
        }));

      await completeOnboarding.mutateAsync({ profileId, selectedTemplates });
      router.refresh();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    setIsCompleting(true);
    try {
      await skipOnboarding.mutateAsync(profileId);
      router.refresh();
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Edge case: no default templates
  if (defaultTemplates.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Default Templates Available
          </h1>
          <p className="text-gray-500 mb-6">
            Start by creating your own custom templates.
          </p>
          <button
            onClick={handleSkip}
            disabled={isCompleting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Please wait...
              </>
            ) : (
              "Get Started"
            )}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Set Up Your Templates
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Select the templates you&apos;d like to use for creating estimates.
            You can customize each template with your own pricing and details.
          </p>
        </div>

        {/* Trade Filter */}
        {tradeTypes.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTrade(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedTrade === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Trades
            </button>
            {tradeTypes.map((trade) => (
              <button
                key={trade}
                onClick={() => setSelectedTrade(trade)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  selectedTrade === trade
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {formatTradeType(trade)}
              </button>
            ))}
          </div>
        )}

        {/* Selection Summary */}
        <div className="bg-blue-50 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            <strong>{selectedIds.size}</strong> template{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                setSelectedIds(new Set());
                setCustomizations({});
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Templates List */}
        <div className="space-y-8 mb-8">
          {Object.entries(templatesByTrade).map(([trade, tradeTemplates]) => (
            <section key={trade}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {formatTradeType(trade)}
              </h2>
              <div className="space-y-3">
                {tradeTemplates.map((template) => (
                  <OnboardingTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedIds.has(template.id)}
                    customizations={customizations[template.id] || null}
                    onToggleSelect={() => handleToggleSelect(template.id)}
                    onCustomize={() => setCustomizingTemplate(template)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 px-4 py-4 mt-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              disabled={isCompleting}
              className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50",
                selectedIds.size > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : selectedIds.size > 0 ? (
                `Add ${selectedIds.size} Template${selectedIds.size !== 1 ? "s" : ""} to My Account`
              ) : (
                "Continue Without Templates"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customize Modal */}
      {customizingTemplate && (
        <TemplateCustomizeModal
          template={customizingTemplate}
          customizations={customizations[customizingTemplate.id] || {}}
          onSave={(data) => handleSaveCustomization(customizingTemplate.id, data)}
          onClose={() => setCustomizingTemplate(null)}
        />
      )}
    </Layout>
  );
}
