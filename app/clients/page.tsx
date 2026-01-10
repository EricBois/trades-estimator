import { getClients, getEstimates, getProjects } from "@/lib/data";
import { ClientsContent } from "./ClientsContent";

export default async function ClientsPage() {
  const [clients, estimates, projects] = await Promise.all([
    getClients(),
    getEstimates(),
    getProjects(),
  ]);

  // Count estimates and projects per client
  const estimateCountByClient = new Map<string, number>();
  const projectCountByClient = new Map<string, number>();

  for (const estimate of estimates) {
    if (estimate.clientId) {
      estimateCountByClient.set(
        estimate.clientId,
        (estimateCountByClient.get(estimate.clientId) ?? 0) + 1
      );
    }
  }

  for (const project of projects) {
    if (project.clientId) {
      projectCountByClient.set(
        project.clientId,
        (projectCountByClient.get(project.clientId) ?? 0) + 1
      );
    }
  }

  return (
    <ClientsContent
      clients={clients}
      estimateCountByClient={Object.fromEntries(estimateCountByClient)}
      projectCountByClient={Object.fromEntries(projectCountByClient)}
    />
  );
}
