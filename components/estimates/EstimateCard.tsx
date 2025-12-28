import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  CheckCircle,
  Eye,
  XCircle,
  AlertCircle,
  FileEdit,
} from "lucide-react";
import type { Estimate } from "@/hooks";
import { formatDate, formatRelative, isExpired, cn } from "@/lib/utils";
import { TRADE_TYPES } from "@/lib/constants";

interface EstimateCardProps {
  estimate: Estimate;
  className?: string;
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

export function EstimateCard({ estimate, className }: EstimateCardProps) {
  const tradeLabel =
    TRADE_TYPES.find((t) => t.value === estimate.templateType)?.label ??
    estimate.templateType;

  const effectiveStatus =
    estimate.status === "sent" && isExpired(estimate.expiresAt)
      ? "expired"
      : estimate.status;

  const statusConfig =
    STATUS_CONFIG[effectiveStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <Link
      href={`/estimates/${estimate.id}`}
      className={cn(
        "block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Main info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900 truncate">
              {estimate.homeownerName}
            </span>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {estimate.homeownerEmail}
            </span>
            {estimate.homeownerPhone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {estimate.homeownerPhone}
              </span>
            )}
          </div>

          {/* Trade and description */}
          <div className="space-y-1">
            <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">
              {tradeLabel}
            </span>
            {estimate.projectDescription && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {estimate.projectDescription}
              </p>
            )}
          </div>

          {/* Footer - Dates */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatRelative(estimate.createdAt)}
            </span>
            {estimate.expiresAt && (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isExpired(estimate.expiresAt) && "text-orange-600"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                {isExpired(estimate.expiresAt)
                  ? "Expired"
                  : `Expires ${formatDate(estimate.expiresAt)}`}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Price and status */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              statusConfig.bg,
              statusConfig.color
            )}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>

          {/* Price */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">
              {estimate.estimateMode === "exact" ? "Exact" : "Ballpark"}
            </div>
            <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
              <DollarSign className="w-4 h-4" />
              {estimate.rangeLow.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

// Empty state component for when there are no estimates
interface EstimateEmptyStateProps {
  onCreateNew?: () => void;
}

export function EstimateEmptyState({ onCreateNew }: EstimateEmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileEdit className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No estimates yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Create your first estimate to start tracking your quotes and winning
        more jobs.
      </p>
      {onCreateNew && (
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Estimate
        </button>
      )}
    </div>
  );
}

// Loading skeleton
export function EstimateCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-100 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
