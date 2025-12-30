"use client";

import Link from "next/link";
import {
  FilePlus,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { EstimateCard, EstimateEmptyState } from "@/components/estimates";
import { QuickTemplatesSection } from "@/components/dashboard";
import type { Estimate } from "@/hooks";

interface Stats {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  declined: number;
  viewed: number;
}

interface Profile {
  id: string;
  email: string | null;
  companyName: string | null;
  hourlyRate: number | null;
  preferredTradeTypes: string[] | null;
  hiddenTemplateIds: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface DashboardContentProps {
  stats: Stats;
  recentEstimates: Estimate[];
  profile: Profile | null;
}

export function DashboardContent({ stats, recentEstimates, profile }: DashboardContentProps) {
  const totalValue = recentEstimates.reduce(
    (sum, e) => sum + (e.rangeLow + e.rangeHigh) / 2,
    0
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{profile?.companyName ? `, ${profile.companyName}` : ""}
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s an overview of your estimates
            </p>
          </div>
          <Link
            href="/estimates/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FilePlus className="w-5 h-5" />
            New Estimate
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total Estimates"
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={Eye}
            label="Viewed"
            value={stats.viewed}
            color="purple"
          />
          <StatCard
            icon={CheckCircle}
            label="Accepted"
            value={stats.accepted}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label="Total Value"
            value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            color="emerald"
          />
        </div>

        {/* Quick Templates */}
        <QuickTemplatesSection recentEstimates={recentEstimates} />

        {/* Recent Estimates */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Estimates</h2>
            </div>
            {recentEstimates.length > 0 && (
              <Link
                href="/estimates"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {recentEstimates.length > 0 ? (
              recentEstimates.map((estimate) => (
                <div key={estimate.id} className="p-4">
                  <EstimateCard estimate={estimate} />
                </div>
              ))
            ) : (
              <EstimateEmptyState />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon={FilePlus}
              title="Create Estimate"
              description="Generate a new estimate for a customer"
              href="/estimates/new"
              color="blue"
            />
            <QuickActionCard
              icon={FileText}
              title="View All Estimates"
              description="Browse and manage your estimates"
              href="/estimates"
              color="gray"
            />
            <QuickActionCard
              icon={TrendingUp}
              title="Pending Follow-ups"
              description={`${stats.sent} estimates awaiting response`}
              href="/estimates?status=sent"
              color="yellow"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "purple" | "green" | "emerald" | "yellow";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  emerald: "bg-emerald-50 text-emerald-600",
  yellow: "bg-yellow-50 text-yellow-600",
};

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: "blue" | "gray" | "yellow";
}

const actionColorClasses = {
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
  gray: "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
  yellow: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100",
};

function QuickActionCard({ icon: Icon, title, description, href, color }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left w-full"
    >
      <div className={`p-3 rounded-lg transition-colors ${actionColorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
