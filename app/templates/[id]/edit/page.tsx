import { getTemplate, getAuthenticatedUser } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { TemplateForm } from "@/components/templates";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const [{ profile }, template] = await Promise.all([
    getAuthenticatedUser(),
    getTemplate(id),
  ]);

  if (!template) {
    notFound();
  }

  // Only allow editing own templates
  if (template.contractorId !== profile?.id) {
    redirect("/templates");
  }

  return <TemplateForm templateId={id} initialData={template} />;
}
