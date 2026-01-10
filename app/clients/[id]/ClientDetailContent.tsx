"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Pencil,
  Trash2,
  FilePlus,
  FolderPlus,
  Calendar,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { EstimateCard, ProjectEstimateGroup } from "@/components/estimates";
import { useDeleteClient } from "@/hooks/useClients";
import { formatRelative, cn } from "@/lib/utils";
import type { Estimate } from "@/hooks";
import type { Project } from "@/lib/project/types";

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
  createdAt: string;
}

interface ClientDetailContentProps {
  client: Client;
  estimates: Estimate[];
  projects: Project[];
}

export function ClientDetailContent({
  client,
  estimates,
  projects,
}: ClientDetailContentProps) {
  const router = useRouter();
  const deleteClient = useDeleteClient();

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this client? This will unlink them from any estimates and projects."
      )
    ) {
      await deleteClient.mutateAsync(client.id);
      router.push("/clients");
    }
  };

  // Format address
  const addressParts = [
    client.street,
    client.city,
    client.state,
    client.zip,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Clients
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-gray-400" />
              {client.name}
            </h1>
            <p className="text-gray-500 mt-1">
              Added {formatRelative(client.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${client.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteClient.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleteClient.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {client.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a
                    href={`tel:${client.phone}`}
                    className="text-gray-900 hover:text-blue-600"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            )}

            {fullAddress && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{fullAddress}</p>
                </div>
              </div>
            )}
          </div>

          {client.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/estimates/new?clientId=${client.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <FilePlus className="w-5 h-5" />
            Create Estimate
          </Link>
          <Link
            href={`/estimates/project/new?clientId=${client.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            Create Project
          </Link>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Projects ({projects.length})
            </h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectEstimateGroup
                  key={project.id}
                  project={project}
                  estimates={estimates.filter(
                    (e) => e.projectId === project.id
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standalone Estimates */}
        {estimates.filter((e) => !e.projectId).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estimates ({estimates.filter((e) => !e.projectId).length})
            </h2>
            <div className="space-y-4">
              {estimates
                .filter((e) => !e.projectId)
                .map((estimate) => (
                  <EstimateCard key={estimate.id} estimate={estimate} />
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && estimates.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No estimates or projects yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create an estimate or project for this client to get started.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
