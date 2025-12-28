export const TRADE_TYPES = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "hvac", label: "HVAC" },
  { value: "carpenter", label: "Carpenter" },
  { value: "framer", label: "Framer" },
  { value: "drywaller", label: "Drywaller" },
  { value: "roofer", label: "Roofer" },
  { value: "painter", label: "Painter" },
  { value: "flooring", label: "Flooring" },
  { value: "tile", label: "Tile" },
  { value: "mason", label: "Mason" },
  { value: "concrete", label: "Concrete" },
  { value: "siding", label: "Siding" },
  { value: "insulation", label: "Insulation" },
  { value: "landscaper", label: "Landscaper" },
  { value: "fencing", label: "Fencing" },
  { value: "deck", label: "Deck Builder" },
  { value: "window_door", label: "Window & Door" },
  { value: "cabinet", label: "Cabinet" },
  { value: "countertop", label: "Countertop" },
  { value: "appliance", label: "Appliance" },
  { value: "handyman", label: "Handyman" },
  { value: "general", label: "General Contractor" },
  { value: "other", label: "Other" },
] as const;

export const ESTIMATE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
] as const;

export const COMPLEXITY_LEVELS = [
  { value: "simple", label: "Simple", multiplier: 0.8 },
  { value: "standard", label: "Standard", multiplier: 1.0 },
  { value: "complex", label: "Complex", multiplier: 1.3 },
  { value: "premium", label: "Premium", multiplier: 1.6 },
] as const;

export const ESTIMATE_MODES = [
  {
    value: "ballpark",
    label: "Ballpark",
    description: "Quick estimate with 15% buffer added",
  },
  {
    value: "exact",
    label: "Exact",
    description: "Precise calculation based on measurements",
  },
] as const;

export const PRICING_MODELS = [
  {
    value: "hourly",
    label: "Hourly Rate",
    description: "Bill by hours worked",
    fields: ["estimatedHours"],
  },
  {
    value: "per_sqft",
    label: "Per Square Foot",
    description: "Bill by square footage",
    fields: ["squareFeet"],
  },
  {
    value: "per_linear_ft",
    label: "Per Linear Foot",
    description: "Bill by linear footage (walls, trim, etc.)",
    fields: ["linearFeet"],
  },
  {
    value: "custom",
    label: "Custom",
    description: "Mixed or custom pricing",
    fields: [],
  },
] as const;
