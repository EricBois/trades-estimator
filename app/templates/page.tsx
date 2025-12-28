import { getTemplates, getAuthenticatedUser, getDefaultTemplates } from "@/lib/data";
import { TemplatesContent } from "./TemplatesContent";
import { TemplatesOnboarding } from "@/components/templates/TemplatesOnboarding";

export default async function TemplatesPage() {
  const [{ profile }, templates] = await Promise.all([
    getAuthenticatedUser(),
    getTemplates(),
  ]);

  // Show onboarding if user hasn't completed it yet
  if (profile && !profile.templatesOnboarded) {
    const defaultTemplates = await getDefaultTemplates();
    return (
      <TemplatesOnboarding
        defaultTemplates={defaultTemplates}
        profileId={profile.id}
      />
    );
  }

  return (
    <TemplatesContent
      templates={templates}
      profileId={profile?.id ?? null}
    />
  );
}
