import { notFound } from "next/navigation";
import { getClient, getClientEstimates, getClientProjects } from "@/lib/data";
import { ClientDetailContent } from "./ClientDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [client, estimates, projects] = await Promise.all([
    getClient(id),
    getClientEstimates(id),
    getClientProjects(id),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <ClientDetailContent
      client={client}
      estimates={estimates}
      projects={projects}
    />
  );
}
