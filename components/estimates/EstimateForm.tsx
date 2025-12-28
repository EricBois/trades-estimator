"use client";

import { useState, useMemo, useCallback } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Calculator, User, Mail, Phone, FileText, Loader2 } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { useTemplate, useCreateEstimate } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { COMPLEXITY_LEVELS, ESTIMATE_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface RequiredField {
  type: "text" | "number" | "select" | "textarea";
  label: string;
  placeholder?: string;
  options?: SelectOption[] | string[];
  min?: number;
  max?: number;
  unit?: string;
}

// Normalize options to always be {value, label} format
function normalizeOptions(options: SelectOption[] | string[] | undefined): SelectOption[] {
  if (!options || !Array.isArray(options)) return [];
  return options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });
}

interface EstimateFormProps {
  className?: string;
}

export function EstimateForm({ className }: EstimateFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const createEstimate = useCreateEstimate();

  // Template selection state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  // Homeowner info
  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Dynamic parameters and complexity
  const [parameters, setParameters] = useState<Record<string, string | number>>(
    {}
  );
  const [complexity, setComplexity] = useState("standard");
  const [estimateMode, setEstimateMode] = useState("ballpark");

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch selected template
  const { data: template } = useTemplate(selectedTemplateId);

  // Parse required fields from template
  const requiredFields = useMemo(() => {
    if (!template?.requiredFields) return [];
    const fields = template.requiredFields as Record<string, RequiredField>;
    return Object.entries(fields).map(([key, field]) => ({
      key,
      ...field,
    }));
  }, [template]);

  // Calculate estimate range based on template and parameters
  const estimateRange = useMemo(() => {
    if (!template) return null;

    const complexityLevel = COMPLEXITY_LEVELS.find(
      (c) => c.value === complexity
    );
    const multiplier = complexityLevel?.multiplier ?? 1.0;

    const hourlyRate = profile?.hourly_rate ?? 75;
    const laborCost = template.baseLaborHours * hourlyRate * multiplier;
    const materialCost = template.baseMaterialCost * multiplier;

    const baseCost = laborCost + materialCost;

    // Apply parameter-based adjustments
    let adjustedCost = baseCost;
    if (
      template.complexityMultipliers &&
      typeof template.complexityMultipliers === "object"
    ) {
      const multipliers = template.complexityMultipliers as Record<
        string,
        number
      >;
      Object.entries(parameters).forEach(([key, value]) => {
        if (multipliers[key] && typeof value === "number") {
          adjustedCost += value * multipliers[key];
        }
      });
    }

    // Get range percentage based on estimate mode
    const mode = ESTIMATE_MODES.find((m) => m.value === estimateMode);
    const rangePercentage = mode?.rangePercentage ?? 0.25;

    // Calculate range using mode's percentage
    // For exact mode (rangePercentage = 0), both low and high are the same
    const low = adjustedCost * (1 - rangePercentage);
    const high = adjustedCost * (1 + rangePercentage);

    return { low, high, isExact: rangePercentage === 0 };
  }, [template, complexity, parameters, estimateMode, profile?.hourly_rate]);

  const handleParameterChange = useCallback(
    (key: string, value: string | number) => {
      setParameters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!selectedTemplateId || !template) {
      newErrors.template = "Please select a template";
    }
    if (!homeownerName.trim()) {
      newErrors.homeownerName = "Homeowner name is required";
    }
    if (!homeownerEmail.trim()) {
      newErrors.homeownerEmail = "Email is required";
    } else if (!z.string().email().safeParse(homeownerEmail).success) {
      newErrors.homeownerEmail = "Please enter a valid email";
    }

    // Validate required fields from template
    requiredFields.forEach((field) => {
      const value = parameters[field.key];
      if (value === undefined || value === "") {
        newErrors[field.key] = `${field.label} is required`;
      } else if (field.type === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.key] = `${field.label} must be a number`;
        } else if (field.min !== undefined && numValue < field.min) {
          newErrors[field.key] = `${field.label} must be at least ${field.min}`;
        } else if (field.max !== undefined && numValue > field.max) {
          newErrors[field.key] = `${field.label} must be at most ${field.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    selectedTemplateId,
    template,
    homeownerName,
    homeownerEmail,
    requiredFields,
    parameters,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !estimateRange || !profile || !template) return;

    setIsSubmitting(true);

    try {
      const estimate = await createEstimate.mutateAsync({
        contractorId: profile.id,
        templateType: template.tradeType,
        templateId: selectedTemplateId ?? undefined,
        homeownerName: homeownerName.trim(),
        homeownerEmail: homeownerEmail.trim(),
        homeownerPhone: homeownerPhone.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        parameters: { ...parameters, complexity },
        rangeLow: estimateRange.low,
        rangeHigh: estimateRange.high,
        estimateMode: estimateMode,
      });

      router.push(`/estimates/${estimate.id}`);
    } catch (error) {
      console.error("Failed to create estimate:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create estimate",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-8", className)}>
      {/* Template Selection Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <FileText className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Select Template</h2>
        </div>
        <TemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={(id) => {
            setSelectedTemplateId(id);
            setParameters({});
          }}
        />
        {errors.template && (
          <p className="text-sm text-red-600">{errors.template}</p>
        )}
      </section>

      {/* Dynamic Parameters Section */}
      {requiredFields.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requiredFields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {field.label}
                  {field.unit && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      ({field.unit})
                    </span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.key}
                    value={String(parameters[field.key] ?? "")}
                    onChange={(e) =>
                      handleParameterChange(field.key, e.target.value)
                    }
                    className={cn(
                      "block w-full px-4 py-3 border rounded-lg shadow-sm bg-white",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors[field.key] ? "border-red-300" : "border-gray-300"
                    )}
                  >
                    <option value="">
                      {field.placeholder ?? "Select..."}
                    </option>
                    {normalizeOptions(field.options).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    value={String(parameters[field.key] ?? "")}
                    onChange={(e) =>
                      handleParameterChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                    rows={3}
                    className={cn(
                      "block w-full px-4 py-3 border rounded-lg shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors[field.key] ? "border-red-300" : "border-gray-300"
                    )}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type === "number" ? "number" : "text"}
                    value={String(parameters[field.key] ?? "")}
                    onChange={(e) =>
                      handleParameterChange(
                        field.key,
                        field.type === "number"
                          ? e.target.valueAsNumber || ""
                          : e.target.value
                      )
                    }
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    className={cn(
                      "block w-full px-4 py-3 border rounded-lg shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors[field.key] ? "border-red-300" : "border-gray-300"
                    )}
                  />
                )}
                {errors[field.key] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Estimate Mode Selector */}
      {template && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Estimate Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ESTIMATE_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setEstimateMode(mode.value)}
                className={cn(
                  "px-5 py-4 rounded-lg border-2 text-left transition-colors",
                  estimateMode === mode.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="font-semibold text-base mb-1 text-gray-900">
                  {mode.label}
                </div>
                <div className="text-sm text-gray-600">{mode.description}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Complexity Selector */}
      {template && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Complexity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMPLEXITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setComplexity(level.value)}
                className={cn(
                  "px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors",
                  complexity === level.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Homeowner Info Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900">
          <User className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Homeowner Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="homeownerName"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Name
            </label>
            <input
              id="homeownerName"
              type="text"
              value={homeownerName}
              onChange={(e) => setHomeownerName(e.target.value)}
              placeholder="John Smith"
              className={cn(
                "block w-full px-4 py-3 border rounded-lg shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.homeownerName ? "border-red-300" : "border-gray-300"
              )}
            />
            {errors.homeownerName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.homeownerName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="homeownerEmail"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              id="homeownerEmail"
              type="email"
              value={homeownerEmail}
              onChange={(e) => setHomeownerEmail(e.target.value)}
              placeholder="john@example.com"
              className={cn(
                "block w-full px-4 py-3 border rounded-lg shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                errors.homeownerEmail ? "border-red-300" : "border-gray-300"
              )}
            />
            {errors.homeownerEmail && (
              <p className="mt-1 text-sm text-red-600">
                {errors.homeownerEmail}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="homeownerPhone"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Phone (optional)
            </label>
            <input
              id="homeownerPhone"
              type="tel"
              value={homeownerPhone}
              onChange={(e) => setHomeownerPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="projectDescription"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Project Notes (optional)
            </label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Any additional notes about the project..."
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Estimate Preview */}
      {estimateRange && (
        <section className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                {estimateRange.isExact ? "Exact Estimate" : "Estimated Range"}
              </h3>
              <p className="text-sm text-blue-600">Based on your selections</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {estimateRange.isExact ? (
              `$${estimateRange.low.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            ) : (
              <>
                ${estimateRange.low.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                -{" "}
                ${estimateRange.high.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </>
            )}
          </div>
        </section>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !template}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 px-6",
          "border border-transparent rounded-lg shadow-sm",
          "text-lg font-medium text-white bg-blue-600",
          "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Estimate...
          </>
        ) : (
          <>
            <Calculator className="w-5 h-5" />
            Create Estimate
          </>
        )}
      </button>
    </form>
  );
}
