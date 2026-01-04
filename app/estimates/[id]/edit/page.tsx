"use client";

import { use } from "react";
import { useEstimate } from "@/hooks";
import { EstimateWizard } from "@/components/estimates/wizard/EstimateWizard";
import { DrywallEstimateWizard } from "@/components/estimates/wizard/trades/drywall";
import { HangingEstimateWizard } from "@/components/estimates/wizard/trades/hanging";
import { Layout } from "@/components/layout";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditEstimatePage({ params }: PageProps) {
  const { id } = use(params);
  const { data: estimate, isLoading } = useEstimate(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!estimate) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Estimate not found
          </h1>
          <p className="text-gray-500 mb-6">
            The estimate you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            href="/estimates"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Estimates
          </Link>
        </div>
      </Layout>
    );
  }

  // Only draft estimates can be edited
  if (estimate.status !== "draft") {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Cannot edit this estimate
          </h1>
          <p className="text-gray-500 mb-6">
            Only draft estimates can be edited. This estimate has already been
            sent.
          </p>
          <Link
            href={`/estimates/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            View Estimate
          </Link>
        </div>
      </Layout>
    );
  }

  // Project estimates should be edited through the project wizard
  if (estimate.projectId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            This is a project estimate
          </h1>
          <p className="text-gray-500 mb-6">
            Project estimates should be edited through the project wizard.
          </p>
          <Link
            href={`/estimates/project/${estimate.projectId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Edit Project
          </Link>
        </div>
      </Layout>
    );
  }

  // Route to appropriate wizard based on trade type
  if (estimate.templateType === "drywall_finishing") {
    return <DrywallEstimateWizard estimateId={id} />;
  }

  if (estimate.templateType === "drywall") {
    return <HangingEstimateWizard estimateId={id} />;
  }

  // Default wizard for other trades
  return (
    <EstimateWizard initialTrade={estimate.templateType} estimateId={id} />
  );
}
