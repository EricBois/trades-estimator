import { z } from "zod";
import { DRYWALL_RATES } from "@/lib/trades/drywallFinishing/constants";
import { HANGING_RATES } from "@/lib/trades/drywallHanging/constants";
import {
  PAINTING_RATES,
  PAINTING_COMPLEXITY_MULTIPLIERS,
} from "@/lib/trades/painting/constants";

const positiveNumber = z.number().min(0, "Must be 0 or greater");
const positiveNumberOptional = z
  .number()
  .min(0, "Must be 0 or greater")
  .optional()
  .or(z.nan().transform(() => undefined));

// Default complexity values
const DEFAULT_COMPLEXITY = {
  simple: 0.85,
  standard: 1.0,
  complex: 1.3,
};

export const settingsSchema = z.object({
  // Profile
  companyName: z.string().optional(),
  hourlyRate: positiveNumberOptional,

  // Drywall Finishing Rates
  sqftStandard: positiveNumber.default(DRYWALL_RATES.sqft_standard.mid),
  sqftPremium: positiveNumber.default(DRYWALL_RATES.sqft_premium.mid),
  linearJoints: positiveNumber.default(DRYWALL_RATES.linear_joints.mid),
  linearCorners: positiveNumber.default(DRYWALL_RATES.linear_corners.mid),

  // Drywall Finishing Add-ons
  addonSanding: positiveNumber.default(150),
  addonPrimer: positiveNumber.default(0.35),
  addonRepairHoles: positiveNumber.default(45),
  addonTextureMatch: positiveNumber.default(200),
  addonHighCeiling: positiveNumber.default(0.25),
  addonDustBarrier: positiveNumber.default(75),

  // Drywall Finishing Complexity
  finishingComplexitySimple: positiveNumber.default(DEFAULT_COMPLEXITY.simple),
  finishingComplexityStandard: positiveNumber.default(
    DEFAULT_COMPLEXITY.standard
  ),
  finishingComplexityComplex: positiveNumber.default(
    DEFAULT_COMPLEXITY.complex
  ),

  // Drywall Hanging Rates
  hangingLaborPerSqft: positiveNumber.default(HANGING_RATES.labor_per_sqft.mid),
  hangingMaterialMarkup: positiveNumber.default(
    HANGING_RATES.material_markup.mid
  ),
  hangingDefaultWaste: positiveNumber.default(0.12),

  // Drywall Hanging Add-ons
  hangingDelivery: positiveNumber.default(150),
  hangingStocking: positiveNumber.default(0.15),
  hangingDebrisRemoval: positiveNumber.default(200),
  hangingCornerBead: positiveNumber.default(2.5),
  hangingInsulation: positiveNumber.default(1.25),
  hangingVaporBarrier: positiveNumber.default(0.45),

  // Drywall Hanging Complexity
  hangingComplexitySimple: positiveNumber.default(DEFAULT_COMPLEXITY.simple),
  hangingComplexityStandard: positiveNumber.default(
    DEFAULT_COMPLEXITY.standard
  ),
  hangingComplexityComplex: positiveNumber.default(DEFAULT_COMPLEXITY.complex),

  // Painting Rates
  paintingLaborPerSqft: positiveNumber.default(
    PAINTING_RATES.labor_per_sqft.mid
  ),
  paintingMaterialPerSqft: positiveNumber.default(
    PAINTING_RATES.material_per_sqft.mid
  ),
  paintingCeilingModifier: positiveNumber.default(
    PAINTING_RATES.ceiling_modifier.mid
  ),

  // Painting Add-ons
  paintingTrimPaint: positiveNumber.default(2.5),
  paintingDoorPaint: positiveNumber.default(75),
  paintingCabinetPaint: positiveNumber.default(150),
  paintingCeilingTexture: positiveNumber.default(0.5),
  paintingAccentWall: positiveNumber.default(0.25),
  paintingWallpaperRemoval: positiveNumber.default(1.5),
  paintingHighCeiling: positiveNumber.default(0.2),
  paintingFurnitureMoving: positiveNumber.default(100),

  // Painting Complexity
  paintingComplexitySimple: positiveNumber.default(
    PAINTING_COMPLEXITY_MULTIPLIERS.simple
  ),
  paintingComplexityStandard: positiveNumber.default(
    PAINTING_COMPLEXITY_MULTIPLIERS.standard
  ),
  paintingComplexityComplex: positiveNumber.default(
    PAINTING_COMPLEXITY_MULTIPLIERS.complex
  ),

  // Framing Rates
  framingLaborPerLinearFt: positiveNumber.default(8),
  framingLaborPerSqft: positiveNumber.default(4),
  framingMaterialMarkup: positiveNumber.default(15),

  // Framing Add-ons
  framingBlocking: positiveNumber.default(15),
  framingHeaderUpgrade: positiveNumber.default(75),
  framingFireBlocking: positiveNumber.default(2),
  framingDemolition: positiveNumber.default(1.5),

  // Framing Complexity
  framingComplexitySimple: positiveNumber.default(DEFAULT_COMPLEXITY.simple),
  framingComplexityStandard: positiveNumber.default(
    DEFAULT_COMPLEXITY.standard
  ),
  framingComplexityComplex: positiveNumber.default(DEFAULT_COMPLEXITY.complex),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
