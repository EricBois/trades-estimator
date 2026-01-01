export {
  useTemplates,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "./useTemplates";
export type { Template, CreateTemplateInput } from "./useTemplates";
export {
  useEstimates,
  useEstimate,
  useCreateEstimate,
  useUpdateEstimate,
  useDeleteEstimate,
} from "./useEstimates";
export type { Estimate, CreateEstimateInput } from "./useEstimates";
export { useUpdateProfile } from "./useProfile";
export type {
  UpdateProfileInput,
  CustomRates,
  DrywallFinishingRates,
  DrywallAddonPrices,
  PaintingRates,
  PaintingAddonPrices,
} from "./useProfile";
export {
  useCompleteOnboarding,
  useSkipOnboarding,
} from "./useTemplatesOnboarding";
export type {
  TemplateCustomization,
  SelectedTemplate,
  CompleteOnboardingInput,
} from "./useTemplatesOnboarding";

// Project hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectRooms,
  useProjectRoomsQuery,
  useProjectEstimate,
} from "./project";
export type {
  CreateProjectInput,
  UpdateProjectInput,
  UseProjectEstimateReturn,
} from "./project";
