import { notFound } from "next/navigation";
import { getClient } from "@/lib/data";
import { EditClientContent } from "./EditClientContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) {
    notFound();
  }

  return <EditClientContent client={client} />;
}
