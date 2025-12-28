"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Send,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
  FileEdit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { useUpdateEstimate, useDeleteEstimate } from "@/hooks";
import { TRADE_TYPES } from "@/lib/constants";
import { formatDate, formatRelative, isExpired, cn } from "@/lib/utils";

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

interface EstimateDetailContentProps {
  estimate: {
    id: string;
    homeownerName: string;
    homeownerEmail: string;
    homeownerPhone: string | null;
    templateType: string;
    status: string;
    rangeLow: number;
    rangeHigh: number;
    estimateMode: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    projectDescription: string | null;
    parameters: Record<string, unknown> | null;
  };
}

export function EstimateDetailContent({ estimate }: EstimateDetailContentProps) {
  const router = useRouter();
  const updateEstimate = useUpdateEstimate();
  const deleteEstimate = useDeleteEstimate();

  const effectiveStatus =
    estimate.status === "sent" && estimate.expiresAt && isExpired(estimate.expiresAt)
      ? "expired"
      : estimate.status;

  const statusConfig =
    STATUS_CONFIG[effectiveStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const tradeLabel =
    TRADE_TYPES.find((t) => t.value === estimate.templateType)?.label ??
    estimate.templateType;

  const handleSend = async () => {
    await updateEstimate.mutateAsync({
      id: estimate.id,
      status: "sent",
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this estimate?")) {
      await deleteEstimate.mutateAsync(estimate.id);
      router.push("/estimates");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/estimates"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to estimates
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {estimate.homeownerName}
                </h1>
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
              </div>
              <p className="text-gray-500">{tradeLabel} Estimate</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {estimate.status === "draft" && (
                <button
                  onClick={handleSend}
                  disabled={updateEstimate.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateEstimate.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send to Customer
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleteEstimate.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleteEstimate.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estimate Amount */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">
                    {estimate.estimateMode === "exact" ? "Exact Estimate" : "Ballpark Estimate"}
                  </p>
                  <p className="text-3xl font-bold">
                    ${estimate.rangeLow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {estimate.estimateMode === "exact"
                      ? "Precise calculation"
                      : "Includes 15% buffer"}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            {estimate.projectDescription && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Project Notes
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {estimate.projectDescription}
                </p>
              </div>
            )}

            {/* Parameters */}
            {estimate.parameters && Object.keys(estimate.parameters).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Project Parameters
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(estimate.parameters).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-gray-500 capitalize">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="font-medium text-gray-900">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {estimate.homeownerName}
                    </p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <a
                      href={`mailto:${estimate.homeownerEmail}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {estimate.homeownerEmail}
                    </a>
                    <p className="text-sm text-gray-500">Email</p>
                  </div>
                </div>

                {estimate.homeownerPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <a
                        href={`tel:${estimate.homeownerPhone}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {estimate.homeownerPhone}
                      </a>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(estimate.createdAt)}
                    </p>
                  </div>
                </div>

                {estimate.expiresAt && (
                  <div className="flex items-center gap-3">
                    <Clock
                      className={cn(
                        "w-5 h-5",
                        isExpired(estimate.expiresAt)
                          ? "text-orange-500"
                          : "text-gray-400"
                      )}
                    />
                    <div>
                      <p className="text-sm text-gray-500">
                        {isExpired(estimate.expiresAt) ? "Expired" : "Expires"}
                      </p>
                      <p
                        className={cn(
                          "font-medium",
                          isExpired(estimate.expiresAt)
                            ? "text-orange-600"
                            : "text-gray-900"
                        )}
                      >
                        {formatDate(estimate.expiresAt)}
                      </p>
                    </div>
                  </div>
                )}

                {estimate.updatedAt !== estimate.createdAt && (
                  <div className="flex items-center gap-3">
                    <Edit className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p className="font-medium text-gray-900">
                        {formatRelative(estimate.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
