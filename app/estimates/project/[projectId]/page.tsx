"use client";

import { use } from "react";
import { ProjectWizard } from "@/components/estimates/wizard/project";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
  const { projectId } = use(params);
  return <ProjectWizard projectId={projectId} />;
}
