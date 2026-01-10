import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EstimatePDFData, DetailLevel } from "@/lib/pdf/types";

interface SendEstimateEmailInput {
  estimateId?: string;
  projectId?: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  projectName?: string;
  projectDescription?: string;
  rangeLow: number;
  rangeHigh: number;
  pdfData: EstimatePDFData;
  detailLevel: DetailLevel;
}

interface SendEstimateEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function useSendEstimateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: SendEstimateEmailInput
    ): Promise<SendEstimateEmailResponse> => {
      const response = await fetch("/api/send-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send estimate");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate estimate queries to reflect "sent" status
      if (variables.estimateId) {
        queryClient.invalidateQueries({
          queryKey: ["estimate", variables.estimateId],
        });
      }
      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["project", variables.projectId],
        });
      }
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
