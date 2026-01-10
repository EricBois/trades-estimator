"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { useDeleteClient } from "@/hooks/useClients";
import { formatRelative, cn } from "@/lib/utils";

export interface ClientCardClient {
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

interface ClientCardProps {
  client: ClientCardClient;
  estimateCount?: number;
  projectCount?: number;
  className?: string;
  onDelete?: (id: string) => void;
}

export function ClientCard({
  client,
  estimateCount = 0,
  projectCount = 0,
  className,
  onDelete,
}: ClientCardProps) {
  const router = useRouter();
  const deleteClient = useDeleteClient();

  // Format address
  const addressParts = [client.city, client.state].filter(Boolean);
  const addressLine = addressParts.length > 0 ? addressParts.join(", ") : null;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/clients/${client.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this client? This will unlink them from any estimates.")) {
      await deleteClient.mutateAsync(client.id);
      onDelete?.(client.id);
      router.refresh();
    }
  };

  return (
    <Link
      href={`/clients/${client.id}`}
      className={cn(
        "block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Main info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900 truncate">
              {client.name}
            </span>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {client.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {client.phone}
              </span>
            )}
          </div>

          {/* Address */}
          {addressLine && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {addressLine}
            </div>
          )}

          {/* Footer - Stats and date */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {estimateCount} estimate{estimateCount !== 1 ? "s" : ""}
              {projectCount > 0 && `, ${projectCount} project${projectCount !== 1 ? "s" : ""}`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Added {formatRelative(client.createdAt)}
            </span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteClient.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleteClient.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

// Empty state component for when there are no clients
interface ClientEmptyStateProps {
  onCreateNew?: () => void;
}

export function ClientEmptyState({ onCreateNew }: ClientEmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No clients yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Add your first client to start organizing your estimates and projects.
      </p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Add Client
        </button>
      )}
    </div>
  );
}

// Loading skeleton
export function ClientCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-100 rounded w-5" />
        </div>
      </div>
    </div>
  );
}
