"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FilePlus,
  FolderOpen,
  DollarSign,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { ProjectEstimateGroup, EstimateCard } from "@/components/estimates";
import type { Estimate } from "@/hooks";
import type { Project } from "@/lib/project/types";

interface Stats {
  totalProjects: number;
  totalEstimates: number;
  accepted: number;
  sent: number;
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
  recentProjects: Project[];
  standaloneEstimates: Estimate[];
  allEstimates: Estimate[];
  profile: Profile | null;
}

export function DashboardContent({
  stats,
  recentProjects,
  standaloneEstimates,
  allEstimates,
  profile,
}: DashboardContentProps) {
  // Calculate total value from all estimates
  const totalValue = allEstimates.reduce((sum, e) => sum + e.rangeLow, 0);

  // Group estimates by project for display
  const projectEstimatesMap = useMemo(() => {
    const map = new Map<string, Estimate[]>();
    for (const estimate of allEstimates) {
      if (estimate.projectId) {
        const existing = map.get(estimate.projectId) || [];
        map.set(estimate.projectId, [...existing, estimate]);
      }
    }
    return map;
  }, [allEstimates]);

  const hasContent =
    recentProjects.length > 0 || standaloneEstimates.length > 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back
              {profile?.companyName ? `, ${profile.companyName}` : ""}
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s an overview of your projects
            </p>
          </div>
          <Link
            href="/estimates/project/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FilePlus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderOpen}
            label="Projects"
            value={stats.totalProjects}
            color="blue"
          />
          <StatCard
            icon={Send}
            label="Sent"
            value={stats.sent}
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
            value={`$${totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}`}
            color="emerald"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            </div>
            {hasContent && (
              <Link
                href="/estimates"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {hasContent ? (
              <div className="p-4 space-y-4">
                {/* Projects */}
                {recentProjects.map((project) => {
                  const projectEstimates =
                    projectEstimatesMap.get(project.id) || [];
                  return (
                    <ProjectEstimateGroup
                      key={project.id}
                      project={project}
                      estimates={projectEstimates}
                      defaultExpanded={false}
                    />
                  );
                })}

                {/* Standalone Estimates */}
                {standaloneEstimates.length > 0 && (
                  <>
                    {recentProjects.length > 0 && (
                      <div className="pt-2 pb-1">
                        <p className="text-sm font-medium text-gray-500">
                          Standalone Estimates
                        </p>
                      </div>
                    )}
                    {standaloneEstimates.map((estimate) => (
                      <EstimateCard key={estimate.id} estimate={estimate} />
                    ))}
                  </>
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "purple" | "green" | "emerald";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  green: "bg-green-50 text-green-600",
  emerald: "bg-emerald-50 text-emerald-600",
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

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No projects yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Create your first project to start building estimates and winning more
        jobs.
      </p>
      <Link
        href="/estimates/project/new"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <FilePlus className="w-4 h-4" />
        Create Project
      </Link>
    </div>
  );
}
