"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Search } from "lucide-react";
import { Layout } from "@/components/layout";
import {
  ClientCard,
  ClientEmptyState,
} from "@/components/clients";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  createdAt: string;
}

interface ClientsContentProps {
  clients: Client[];
  estimateCountByClient: Record<string, number>;
  projectCountByClient: Record<string, number>;
}

export function ClientsContent({
  clients,
  estimateCountByClient,
  projectCountByClient,
}: ClientsContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query) ||
        client.city?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500 mt-1">
              Manage your clients and their estimates
            </p>
          </div>

          {/* New Client Button */}
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Client
          </Link>
        </div>

        {/* Search */}
        {clients.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, email, phone, or city..."
              className={cn(
                "w-full pl-10 pr-4 py-3 text-base",
                "border border-gray-300 rounded-xl bg-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
          </div>
        )}

        {/* Client List */}
        {clients.length === 0 ? (
          <ClientEmptyState onCreateNew={() => router.push("/clients/new")} />
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No clients match your search</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                estimateCount={estimateCountByClient[client.id] ?? 0}
                projectCount={projectCountByClient[client.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
