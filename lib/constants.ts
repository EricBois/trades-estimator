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

// Wizard-specific trade types (MVP: interior systems only)
export const WIZARD_TRADE_TYPES = [
  { value: "framing", label: "Framing", icon: "Hammer" },
  { value: "drywall", label: "Drywall", icon: "Home" },
  { value: "drywall_finishing", label: "Drywall Finishing", icon: "Sparkles" },
  { value: "painting", label: "Painting", icon: "Paintbrush" },
] as const;

// Simplified complexity levels for wizard (3 levels instead of 4)
export const WIZARD_COMPLEXITY_LEVELS = [
  { value: "simple", label: "Simple", multiplier: 0.8 },
  { value: "standard", label: "Normal", multiplier: 1.0 },
  { value: "complex", label: "Complex", multiplier: 1.3 },
] as const;

export const COMPLEXITY_DESCRIPTIONS: Record<string, string> = {
  simple: "Basic work, standard materials, easy access",
  standard: "Typical residential job, normal conditions",
  complex: "Challenging layout, obstacles, or custom work",
};

// Pricing types for templates
export const PRICING_TYPES = [
  { value: "hourly", label: "Hourly", description: "Charge by the hour" },
  { value: "contract", label: "Contract", description: "Fixed price for the job" },
  { value: "hybrid", label: "Hybrid", description: "Base price + hourly for extras" },
] as const;

// Default templates for wizard (used when contractor has no templates)
export const DEFAULT_WIZARD_TEMPLATES = [
  // Framing templates
  {
    id: "default-framing-hourly",
    templateName: "Framing - Hourly",
    tradeType: "framing",
    pricingType: "hourly",
    description: "Hourly rate for framing work",
    baseLaborHours: 1,
    baseMaterialCost: 0,
    requiredFields: {
      estimated_hours: {
        type: "number",
        label: "Estimated Hours",
        min: 1,
        max: 100,
        unit: "hours",
      },
    },
  },
  {
    id: "default-framing-contract",
    templateName: "Framing - Per Wall",
    tradeType: "framing",
    pricingType: "contract",
    description: "Fixed price per wall section",
    baseLaborHours: 4,
    baseMaterialCost: 150,
    requiredFields: {
      wall_count: {
        type: "number",
        label: "Number of Walls",
        min: 1,
        max: 20,
      },
      wall_height: {
        type: "select",
        label: "Wall Height",
        options: [
          { value: "8", label: "8 ft (Standard)" },
          { value: "9", label: "9 ft" },
          { value: "10", label: "10 ft" },
        ],
      },
    },
    complexityMultipliers: {
      wall_count: 75,
    },
  },
  // Drywall templates
  {
    id: "default-drywall-hourly",
    templateName: "Drywall - Hourly",
    tradeType: "drywall",
    pricingType: "hourly",
    description: "Hourly rate for drywall installation",
    baseLaborHours: 1,
    baseMaterialCost: 0,
    requiredFields: {
      estimated_hours: {
        type: "number",
        label: "Estimated Hours",
        min: 1,
        max: 100,
        unit: "hours",
      },
    },
  },
  {
    id: "default-drywall-contract",
    templateName: "Drywall - Per Sheet",
    tradeType: "drywall",
    pricingType: "contract",
    description: "Fixed price per sheet installed",
    baseLaborHours: 0.5,
    baseMaterialCost: 15,
    requiredFields: {
      sheet_count: {
        type: "number",
        label: "Number of Sheets",
        min: 1,
        max: 200,
      },
      sheet_type: {
        type: "select",
        label: "Drywall Type",
        options: [
          { value: "regular", label: "Regular 1/2\"" },
          { value: "moisture", label: "Moisture Resistant" },
          { value: "fire", label: "Fire Rated" },
        ],
      },
    },
    complexityMultipliers: {
      sheet_count: 25,
    },
  },
  // Drywall Finishing templates
  {
    id: "default-finishing-hourly",
    templateName: "Finishing - Hourly",
    tradeType: "drywall_finishing",
    pricingType: "hourly",
    description: "Hourly rate for taping and finishing",
    baseLaborHours: 1,
    baseMaterialCost: 0,
    requiredFields: {
      estimated_hours: {
        type: "number",
        label: "Estimated Hours",
        min: 1,
        max: 100,
        unit: "hours",
      },
    },
  },
  {
    id: "default-finishing-contract",
    templateName: "Finishing - Per Room",
    tradeType: "drywall_finishing",
    pricingType: "contract",
    description: "Fixed price per room",
    baseLaborHours: 3,
    baseMaterialCost: 50,
    requiredFields: {
      room_count: {
        type: "number",
        label: "Number of Rooms",
        min: 1,
        max: 20,
      },
      finish_level: {
        type: "select",
        label: "Finish Level",
        options: [
          { value: "level3", label: "Level 3 (Standard)" },
          { value: "level4", label: "Level 4 (Paint Ready)" },
          { value: "level5", label: "Level 5 (Premium)" },
        ],
      },
    },
    complexityMultipliers: {
      room_count: 120,
    },
  },
  // Painting templates
  {
    id: "default-painting-hourly",
    templateName: "Painting - Hourly",
    tradeType: "painting",
    pricingType: "hourly",
    description: "Hourly rate for painting work",
    baseLaborHours: 1,
    baseMaterialCost: 0,
    requiredFields: {
      estimated_hours: {
        type: "number",
        label: "Estimated Hours",
        min: 1,
        max: 100,
        unit: "hours",
      },
    },
  },
  {
    id: "default-painting-contract",
    templateName: "Painting - Per Room",
    tradeType: "painting",
    pricingType: "contract",
    description: "Fixed price per room including paint",
    baseLaborHours: 2,
    baseMaterialCost: 75,
    requiredFields: {
      room_count: {
        type: "number",
        label: "Number of Rooms",
        min: 1,
        max: 20,
      },
      paint_type: {
        type: "select",
        label: "Paint Quality",
        options: [
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "specialty", label: "Specialty" },
        ],
      },
    },
    complexityMultipliers: {
      room_count: 150,
    },
  },
] as const;
