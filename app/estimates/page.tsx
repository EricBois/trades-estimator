import { getEstimates } from "@/lib/data";
import { EstimatesContent } from "./EstimatesContent";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function EstimatesPage({ searchParams }: PageProps) {
  const [{ status }, estimates] = await Promise.all([
    searchParams,
    getEstimates(),
  ]);

  return (
    <EstimatesContent
      estimates={estimates}
      initialStatus={status ?? "all"}
    />
  );
}
