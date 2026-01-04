import { getEstimates, getProjects } from "@/lib/data";
import { EstimatesContent } from "./EstimatesContent";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function EstimatesPage({ searchParams }: PageProps) {
  const [{ status }, estimates, projects] = await Promise.all([
    searchParams,
    getEstimates(),
    getProjects(),
  ]);

  return (
    <EstimatesContent
      estimates={estimates}
      projects={projects}
      initialStatus={status ?? "all"}
    />
  );
}
