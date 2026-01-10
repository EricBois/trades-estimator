"use client";

import { useState } from "react";
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
  Pencil,
  CheckCircle,
  XCircle,
  Eye,
  FileEdit,
  Loader2,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Layout } from "@/components/layout";
import {
  useUpdateEstimate,
  useDeleteEstimate,
  useSendEstimateEmail,
} from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatRelative, isExpired, cn } from "@/lib/utils";
import type { EstimatePDFData } from "@/lib/pdf/types";

// Trade type labels for display
const TRADE_LABELS: Record<string, string> = {
  drywall_hanging: "Drywall Hanging",
  drywall_finishing: "Drywall Finishing",
  painting: "Painting",
  framing: "Framing",
  multi_trade: "Multi-Trade Project",
};

// Helper to format sheet info
function formatSheets(sheets: unknown): string | null {
  if (!Array.isArray(sheets) || sheets.length === 0) return null;

  const totalSheets = sheets.reduce((sum, s) => sum + (s.quantity || 0), 0);
  if (totalSheets === 0) return null;

  // Get the primary sheet type
  const primary = sheets[0];
  const typeLabels: Record<string, string> = {
    standard_half: '1/2" Standard',
    standard_5_8: '5/8" Standard',
    fire_rated: "Fire Rated",
    moisture_resistant: "Moisture Resistant",
    mold_resistant: "Mold Resistant",
  };
  const typeLabel = typeLabels[primary.typeId] || primary.typeId;

  return `${totalSheets} sheets (${typeLabel}, ${primary.size || "4x8"})`;
}

// Helper to format complexity
function formatComplexity(complexity: unknown): string {
  const labels: Record<string, string> = {
    simple: "Simple",
    standard: "Standard",
    complex: "Complex",
  };
  return labels[String(complexity)] || String(complexity);
}

// Helper to format ceiling factor
function formatCeilingFactor(factor: unknown): string {
  const labels: Record<string, string> = {
    standard: "Standard (8')",
    nine_ft: "9' Ceilings",
    ten_ft: "10' Ceilings",
    cathedral: "Cathedral/Vaulted",
  };
  return labels[String(factor)] || String(factor);
}

// Helper to format finish level
function formatFinishLevel(level: unknown): string {
  const labels: Record<number, string> = {
    3: "Level 3 - Standard",
    4: "Level 4 - Premium",
    5: "Level 5 - Smooth Wall",
  };
  return labels[Number(level)] || `Level ${level}`;
}

// Helper to format paint quality
function formatPaintQuality(quality: unknown): string {
  const labels: Record<string, string> = {
    standard: "Standard",
    premium: "Premium",
    specialty: "Specialty",
  };
  return labels[String(quality)] || String(quality);
}

// Helper to format surface prep
function formatSurfacePrep(prep: unknown): string {
  const labels: Record<string, string> = {
    none: "Minimal",
    light: "Light",
    heavy: "Heavy",
  };
  return labels[String(prep)] || String(prep);
}

// Component to display formatted estimate details
function EstimateDetailsCard({
  templateType,
  parameters,
}: {
  templateType: string;
  parameters: Record<string, unknown>;
}) {
  const details: Array<{ label: string; value: string }> = [];

  if (templateType === "drywall_hanging") {
    const sheetsInfo = formatSheets(parameters.sheets);
    if (sheetsInfo) {
      details.push({ label: "Materials", value: sheetsInfo });
    }
    if (parameters.complexity) {
      details.push({
        label: "Complexity",
        value: formatComplexity(parameters.complexity),
      });
    }
    if (parameters.ceilingFactor && parameters.ceilingFactor !== "standard") {
      details.push({
        label: "Ceiling Height",
        value: formatCeilingFactor(parameters.ceilingFactor),
      });
    }
    if (parameters.wasteFactor) {
      details.push({
        label: "Waste Factor",
        value: `${Math.round(Number(parameters.wasteFactor) * 100)}%`,
      });
    }
  } else if (templateType === "drywall_finishing") {
    if (parameters.finishLevel) {
      details.push({
        label: "Finish Level",
        value: formatFinishLevel(parameters.finishLevel),
      });
    }
    if (parameters.complexity) {
      details.push({
        label: "Complexity",
        value: formatComplexity(parameters.complexity),
      });
    }
  } else if (templateType === "painting") {
    if (parameters.coatCount) {
      details.push({
        label: "Coats",
        value: `${parameters.coatCount} coat${
          Number(parameters.coatCount) !== 1 ? "s" : ""
        }`,
      });
    }
    if (parameters.paintQuality) {
      details.push({
        label: "Paint Quality",
        value: formatPaintQuality(parameters.paintQuality),
      });
    }
    if (parameters.surfacePrep && parameters.surfacePrep !== "none") {
      details.push({
        label: "Surface Prep",
        value: formatSurfacePrep(parameters.surfacePrep),
      });
    }
    if (parameters.complexity) {
      details.push({
        label: "Complexity",
        value: formatComplexity(parameters.complexity),
      });
    }
    const totalSqft =
      (Number(parameters.wallSqft) || 0) +
      (Number(parameters.ceilingSqft) || 0);
    if (totalSqft > 0) {
      details.push({
        label: "Total Area",
        value: `${totalSqft.toLocaleString()} sq ft`,
      });
    }
  }

  if (details.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Estimate Details</h3>
      <dl className="grid grid-cols-2 gap-4">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="font-medium text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
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

interface EstimateDetailContentProps {
  estimate: {
    id: string;
    name: string | null;
    homeownerName: string;
    homeownerEmail: string;
    homeownerPhone: string | null;
    templateType: string;
    status: string;
    rangeLow: number;
    rangeHigh: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    projectDescription: string | null;
    parameters: Record<string, unknown> | null;
    projectId: string | null;
  };
}

export function EstimateDetailContent({
  estimate,
}: EstimateDetailContentProps) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const updateEstimate = useUpdateEstimate();
  const deleteEstimate = useDeleteEstimate();
  const sendEstimateEmail = useSendEstimateEmail();
  const [isSending, setIsSending] = useState(false);

  const effectiveStatus =
    estimate.status === "sent" &&
    estimate.expiresAt &&
    isExpired(estimate.expiresAt)
      ? "expired"
      : estimate.status;

  const statusConfig =
    STATUS_CONFIG[effectiveStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const tradeLabel =
    TRADE_LABELS[estimate.templateType] ??
    estimate.templateType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSend = async () => {
    if (!profile) return;

    setIsSending(true);
    try {
      // Build basic PDF data from estimate
      const pdfData: EstimatePDFData = {
        contractor: {
          companyName: profile.company_name ?? "Contractor",
          email: user?.email ?? "",
          logoUrl: profile.logo_url ?? undefined,
        },
        recipient: {
          name: estimate.homeownerName,
          email: estimate.homeownerEmail,
          phone: estimate.homeownerPhone ?? undefined,
        },
        projectName: tradeLabel,
        projectDescription: estimate.projectDescription ?? undefined,
        singleTrade: {
          tradeType: estimate.templateType,
          tradeLabel,
        },
        total: (estimate.rangeLow + estimate.rangeHigh) / 2,
        rangeLow: estimate.rangeLow,
        rangeHigh: estimate.rangeHigh,
        createdAt: new Date(estimate.createdAt),
        validUntil: estimate.expiresAt
          ? new Date(estimate.expiresAt)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      // Send email
      await sendEstimateEmail.mutateAsync({
        estimateId: estimate.id,
        recipientEmail: estimate.homeownerEmail,
        recipientName: estimate.homeownerName,
        recipientPhone: estimate.homeownerPhone ?? undefined,
        projectName: tradeLabel,
        projectDescription: estimate.projectDescription ?? undefined,
        rangeLow: estimate.rangeLow,
        rangeHigh: estimate.rangeHigh,
        pdfData,
        detailLevel: "simple", // Use simple for resends from detail page
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to send estimate:", error);
      // Still update status even if email fails
      await updateEstimate.mutateAsync({
        id: estimate.id,
        status: "sent",
      });
      router.refresh();
    } finally {
      setIsSending(false);
    }
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
                  {estimate.name || estimate.homeownerName}
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
              {/* Edit button for draft standalone estimates */}
              {estimate.status === "draft" && !estimate.projectId && (
                <Link
                  href={`/estimates/${estimate.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}
              {estimate.status === "draft" && (
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSending ? "Sending..." : "Send to Customer"}
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
            {/* Estimate Price/Range */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">
                    {estimate.rangeLow === estimate.rangeHigh
                      ? "Estimate Total"
                      : "Estimated Range"}
                  </p>
                  <p className="text-3xl font-bold">
                    $
                    {estimate.rangeLow.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                    {estimate.rangeLow !== estimate.rangeHigh && (
                      <>
                        {" - "}$
                        {estimate.rangeHigh.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </>
                    )}
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

            {/* Estimate Details */}
            {estimate.parameters && (
              <EstimateDetailsCard
                templateType={estimate.templateType}
                parameters={estimate.parameters}
              />
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
