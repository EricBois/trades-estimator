"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { ClientForm } from "@/components/clients";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
}

interface EditClientContentProps {
  client: Client;
}

export function EditClientContent({ client }: EditClientContentProps) {
  const router = useRouter();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/clients/${client.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Client</h1>
          <p className="text-gray-500 mt-1">Update client information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ClientForm
            clientId={client.id}
            initialData={{
              name: client.name,
              email: client.email ?? "",
              phone: client.phone ?? "",
              street: client.street ?? "",
              city: client.city ?? "",
              state: client.state ?? "",
              zip: client.zip ?? "",
              notes: client.notes ?? "",
            }}
            onCancel={() => router.push(`/clients/${client.id}`)}
          />
        </div>
      </div>
    </Layout>
  );
}
