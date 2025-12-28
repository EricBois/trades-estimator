"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { EstimateForm } from "@/components/estimates";

export default function NewEstimatePage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/estimates"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to estimates
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Estimate</h1>
          <p className="text-gray-500 mt-1">
            Create a quick estimate for your customer
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <EstimateForm />
        </div>
      </div>
    </Layout>
  );
}
