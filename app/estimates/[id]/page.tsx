import { getEstimate } from "@/lib/data";
import { notFound } from "next/navigation";
import { EstimateDetailContent } from "./EstimateDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstimateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const estimate = await getEstimate(id);

  if (!estimate) {
    notFound();
  }

  return <EstimateDetailContent estimate={estimate} />;
}
