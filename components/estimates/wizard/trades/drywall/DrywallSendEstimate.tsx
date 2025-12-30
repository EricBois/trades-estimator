"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Mail, User, Phone, FileText, Loader2, Send } from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import { useCreateEstimate } from "@/hooks/useEstimates";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function DrywallSendEstimate() {
  const router = useRouter();
  const { profile } = useAuth();
  const createEstimate = useCreateEstimate();
  const { finishLevel, lineItems, addons, complexity, totals } = useDrywallEstimate();

  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!homeownerName.trim()) {
      newErrors.homeownerName = "Name is required";
    }
    if (!homeownerEmail.trim()) {
      newErrors.homeownerEmail = "Email is required";
    } else if (!z.string().email().safeParse(homeownerEmail).success) {
      newErrors.homeownerEmail = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !profile) return;

    setIsSubmitting(true);

    try {
      // Prepare drywall-specific parameters
      const parameters = {
        finishLevel,
        lineItems: lineItems.map((item) => ({
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
        })),
        addons: addons.map((addon) => ({
          id: addon.id,
          quantity: addon.quantity,
          total: addon.total,
        })),
        complexity,
        totals: {
          lineItemsSubtotal: totals.lineItemsSubtotal,
          addonsSubtotal: totals.addonsSubtotal,
          complexityAdjustment: totals.complexityAdjustment,
        },
      };

      const estimate = await createEstimate.mutateAsync({
        contractorId: profile.id,
        templateType: "drywall_finishing",
        homeownerName: homeownerName.trim(),
        homeownerEmail: homeownerEmail.trim(),
        homeownerPhone: homeownerPhone.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        parameters,
        rangeLow: totals.total,
        rangeHigh: totals.total,
      });

      router.push(`/estimates/${estimate.id}`);
    } catch (error) {
      console.error("Failed to create estimate:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create estimate",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Send Estimate
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Enter the homeowner&apos;s details
      </p>

      {/* Price summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-center">
        <span className="text-lg font-bold text-blue-900">
          ${formatCurrency(totals.total)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Name
          </label>
          <input
            type="text"
            value={homeownerName}
            onChange={(e) => setHomeownerName(e.target.value)}
            placeholder="John Smith"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerName ? "border-red-300" : "border-gray-300"
            )}
          />
          {errors.homeownerName && (
            <p className="mt-1 text-sm text-red-600">{errors.homeownerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={homeownerEmail}
            onChange={(e) => setHomeownerEmail(e.target.value)}
            placeholder="john@example.com"
            inputMode="email"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerEmail ? "border-red-300" : "border-gray-300"
            )}
          />
          {errors.homeownerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.homeownerEmail}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={homeownerPhone}
            onChange={(e) => setHomeownerPhone(e.target.value)}
            placeholder="(555) 555-5555"
            inputMode="tel"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Any additional notes about the project..."
            rows={3}
            className={cn(
              "w-full px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-2 mt-6",
          "min-h-[60px] px-6",
          "bg-blue-600 text-white rounded-xl",
          "hover:bg-blue-700 active:scale-[0.98]",
          "transition-all font-medium text-lg cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Estimate
          </>
        )}
      </button>
    </div>
  );
}
