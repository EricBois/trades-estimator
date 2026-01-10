"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { User, Mail, Phone } from "lucide-react";
import { z } from "zod";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { ClientSelector } from "@/components/clients/ClientSelector";
import { StepHeader } from "@/components/ui/StepHeader";
import { useClient } from "@/hooks/useClients";
import { ZodForm } from "@/components/ui/ZodForm";

const clientStepSchema = z.object({
  clientId: z.string().nullable().optional(),
});

// Wrapper component that provides ZodForm context
export function ClientStep() {
  const { clientId } = useWizardData();

  return (
    <ZodForm
      schema={clientStepSchema}
      defaultValues={{ clientId: clientId || null }}
    >
      <ClientStepContent />
    </ZodForm>
  );
}

// Content component
function ClientStepContent() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { clientId, updateData } = useWizardData();

  // Fetch selected client details for display
  const { data: selectedClient } = useClient(clientId ?? undefined);

  // Configure footer - always enabled since client selection is optional
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: clientId ? "Continue" : "Skip",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, clientId]);

  const handleClientChange = (id: string | null) => {
    updateData({ clientId: id });
  };

  const handleClientSelect = (client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }) => {
    // Auto-fill homeowner fields if they're empty
    updateData({
      clientId: client.id,
      homeownerName: client.name,
      homeownerEmail: client.email ?? "",
      homeownerPhone: client.phone ?? "",
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <StepHeader
        title="Select Client"
        description="Link this estimate to a client (optional)"
      />

      <div className="space-y-6">
        <ClientSelector
          value={clientId}
          onChange={handleClientChange}
          onClientSelect={handleClientSelect}
          placeholder="Search or add a client..."
        />

        {/* Selected client summary */}
        {selectedClient && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">
                  {selectedClient.name}
                </h3>
                {selectedClient.email && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Helper text */}
        <p className="text-sm text-gray-500 text-center">
          You can also skip this step and add a client later
        </p>
      </div>
    </div>
  );
}
