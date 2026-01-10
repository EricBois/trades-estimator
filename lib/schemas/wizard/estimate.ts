import { z } from "zod";

// Schema for the SendEstimate step - homeowner/recipient details
export const sendEstimateSchema = z.object({
  estimateName: z.string().optional(),
  homeownerName: z.string().min(1, "Name is required"),
  homeownerEmail: z.string().min(1, "Email is required").email("Please enter a valid email"),
  homeownerPhone: z.string().optional(),
  projectDescription: z.string().optional(),
});

// Schema for when a client is selected (no manual validation needed)
export const sendEstimateWithClientSchema = z.object({
  estimateName: z.string().optional(),
  projectDescription: z.string().optional(),
});

// Schema for template step
export const templateStepSchema = z.object({
  templateId: z.string().min(1, "Please select a template"),
  estimateName: z.string().optional(),
});

// Schema for complexity step
export const complexityStepSchema = z.object({
  complexity: z.enum(["simple", "standard", "complex"], {
    message: "Please select a complexity level",
  }),
});
