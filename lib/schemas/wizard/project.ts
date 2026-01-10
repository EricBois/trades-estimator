import { z } from "zod";

// Schema for project send estimate step
export const projectSendEstimateSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  homeownerName: z.string().min(1, "Name is required"),
  homeownerEmail: z.string().min(1, "Email is required").email("Please enter a valid email"),
  homeownerPhone: z.string().optional(),
  projectDescription: z.string().optional(),
});

// Schema for when a client is selected in project wizard
export const projectSendEstimateWithClientSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().optional(),
});

// Schema for trade selection step
export const tradeSelectionSchema = z.object({
  enabledTrades: z.array(z.enum(["drywall_hanging", "drywall_finishing", "painting"])).min(1, "Select at least one trade"),
  projectName: z.string().optional(),
});

// Schema for room configuration
export const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  lengthFeet: z.number().min(1, "Length is required"),
  lengthInches: z.number().min(0).max(11),
  widthFeet: z.number().min(1, "Width is required"),
  widthInches: z.number().min(0).max(11),
  heightFeet: z.number().min(1, "Height is required"),
  heightInches: z.number().min(0).max(11),
});

export const roomsStepSchema = z.object({
  rooms: z.array(roomSchema).min(1, "Add at least one room"),
});
