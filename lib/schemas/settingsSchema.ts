import { z } from "zod";
import { DRYWALL_RATES } from "@/lib/trades/drywallFinishing/constants";
import { HANGING_RATES } from "@/lib/trades/drywallHanging/constants";

const positiveNumber = z.number().min(0, "Must be 0 or greater");
const positiveNumberOptional = z
  .number()
  .min(0, "Must be 0 or greater")
  .optional()
  .or(z.nan().transform(() => undefined));

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

  // Drywall Hanging Rates
  hangingLaborPerSheet: positiveNumber.default(
    HANGING_RATES.labor_per_sheet.mid
  ),
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
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
