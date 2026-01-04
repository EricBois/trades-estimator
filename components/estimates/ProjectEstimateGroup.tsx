"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
  Pencil,
  FolderOpen,
  CheckCircle,
  Eye,
  XCircle,
  AlertCircle,
  FileEdit,
  Mail,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn, formatRelative, isExpired } from "@/lib/utils";
import { useDeleteProject } from "@/hooks";
import type { Estimate } from "@/hooks";
import type { Project } from "@/lib/project/types";

// Trade type labels for display
const TRADE_LABELS: Record<string, string> = {
  drywall_hanging: "Drywall Hanging",
  drywall_finishing: "Drywall Finishing",
  painting: "Painting",
  framing: "Framing",
  multi_trade: "Multi-Trade Project",
};

interface ProjectEstimateGroupProps {
  project: Project;
  estimates: Estimate[];
  defaultExpanded?: boolean;
}

const STATUS_CONFIG = {
  draft: {
    icon: FileEdit,
    color: "text-gray-600",
    bg: "bg-gray-100",
    label: "Draft",
  },
  sent: {
    icon: Mail,
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Sent",
  },
  viewed: {
    icon: Eye,
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Viewed",
  },
  accepted: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    label: "Accepted",
  },
  declined: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    label: "Declined",
  },
  expired: {
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-100",
    label: "Expired",
  },
} as const;

export function ProjectEstimateGroup({
  project,
  estimates,
  defaultExpanded = false,
}: ProjectEstimateGroupProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const deleteProject = useDeleteProject();

  // Calculate combined total from all estimates
  const combinedTotal = estimates.reduce((sum, est) => sum + est.rangeLow, 0);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? This will also delete all associated estimates.`
      )
    ) {
      await deleteProject.mutateAsync(project.id);
      router.refresh();
    }
  };

  // Determine effective status (check if expired)
  const effectiveStatus =
    project.status === "sent" &&
    project.expiresAt &&
    isExpired(project.expiresAt)
      ? "expired"
      : project.status;

  const statusConfig =
    STATUS_CONFIG[effectiveStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Expand/collapse icon */}
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>

            {/* Project icon */}
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                    statusConfig.bg,
                    statusConfig.color
                  )}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatRelative(project.createdAt)}
                </span>
                <span>
                  {estimates.length} trade{estimates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Combined total */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                <DollarSign className="w-4 h-4" />
                {combinedTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {project.status === "draft" && (
                <Link
                  href={`/estimates/project/${project.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}
              <button
                onClick={handleDelete}
                disabled={deleteProject.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deleteProject.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content - trade estimates */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            {estimates.map((estimate) => {
              const tradeLabel =
                TRADE_LABELS[estimate.templateType] ??
                estimate.templateType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <Link
                  key={estimate.id}
                  href={`/estimates/${estimate.id}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">
                      {tradeLabel}
                    </span>
                    {estimate.projectDescription && (
                      <span className="text-sm text-gray-500 truncate max-w-xs">
                        {estimate.projectDescription}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${estimate.rangeLow.toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
