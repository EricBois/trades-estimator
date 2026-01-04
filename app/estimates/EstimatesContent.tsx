"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FilePlus,
  Search,
  Filter,
  X,
  ChevronDown,
  FolderPlus,
  FileText,
} from "lucide-react";
import { Layout } from "@/components/layout";
import {
  EstimateCard,
  EstimateEmptyState,
  ProjectEstimateGroup,
} from "@/components/estimates";
import { ESTIMATE_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Estimate } from "@/hooks";
import type { Project } from "@/lib/project/types";

interface EstimatesContentProps {
  estimates: Estimate[];
  projects: Project[];
  initialStatus: string;
}

export function EstimatesContent({
  estimates,
  projects,
  initialStatus,
}: EstimatesContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create a map of projects for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    for (const project of projects) {
      map.set(project.id, project);
    }
    return map;
  }, [projects]);

  // Filter estimates based on status and search
  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) => {
      // Status filter - for project estimates, also check project status
      if (statusFilter !== "all") {
        if (estimate.projectId) {
          const project = projectMap.get(estimate.projectId);
          if (project && project.status !== statusFilter) {
            return false;
          }
        } else if (estimate.status !== statusFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        // Search in estimate fields
        const estimateMatch =
          estimate.homeownerName.toLowerCase().includes(query) ||
          estimate.homeownerEmail.toLowerCase().includes(query) ||
          estimate.projectDescription?.toLowerCase().includes(query);

        // If part of a project, also search project name
        if (estimate.projectId) {
          const project = projectMap.get(estimate.projectId);
          if (project?.name.toLowerCase().includes(query)) {
            return true;
          }
        }

        return estimateMatch;
      }

      return true;
    });
  }, [estimates, statusFilter, searchQuery, projectMap]);

  // Group filtered estimates by project
  const { groupedEstimates, standaloneEstimates } = useMemo(() => {
    const grouped = new Map<string, Estimate[]>();
    const standalone: Estimate[] = [];

    for (const estimate of filteredEstimates) {
      if (estimate.projectId) {
        const existing = grouped.get(estimate.projectId) || [];
        grouped.set(estimate.projectId, [...existing, estimate]);
      } else {
        standalone.push(estimate);
      }
    }

    return { groupedEstimates: grouped, standaloneEstimates: standalone };
  }, [filteredEstimates]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Update URL without full navigation
    const params = new URLSearchParams();
    if (status !== "all") {
      params.set("status", status);
    }
    const query = params.toString();
    router.replace(`/estimates${query ? `?${query}` : ""}`, { scroll: false });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
            <p className="text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""},{" "}
              {standaloneEstimates.length} standalone
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FilePlus className="w-5 h-5" />
              New
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showNewMenu && "rotate-180"
                )}
              />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/estimates/project/new"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNewMenu(false)}
                >
                  <FolderPlus className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">New Project</div>
                    <div className="text-xs text-gray-500">
                      Multi-trade estimate bundle
                    </div>
                  </div>
                </Link>
                <Link
                  href="/estimates/new"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNewMenu(false)}
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">New Estimate</div>
                    <div className="text-xs text-gray-500">
                      Single standalone estimate
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex gap-1 flex-wrap">
                <FilterButton
                  active={statusFilter === "all"}
                  onClick={() => handleStatusChange("all")}
                >
                  All
                </FilterButton>
                {ESTIMATE_STATUSES.map((status) => (
                  <FilterButton
                    key={status.value}
                    active={statusFilter === status.value}
                    onClick={() => handleStatusChange(status.value)}
                  >
                    {status.label}
                  </FilterButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {groupedEstimates.size > 0 || standaloneEstimates.length > 0 ? (
            <>
              {/* Project groups first */}
              {Array.from(groupedEstimates.entries()).map(
                ([projectId, projectEstimates]) => {
                  const project = projectMap.get(projectId);
                  if (!project) return null;
                  return (
                    <ProjectEstimateGroup
                      key={projectId}
                      project={project}
                      estimates={projectEstimates}
                      defaultExpanded={groupedEstimates.size === 1}
                    />
                  );
                }
              )}

              {/* Standalone estimates */}
              {standaloneEstimates.map((estimate) => (
                <EstimateCard key={estimate.id} estimate={estimate} />
              ))}
            </>
          ) : estimates.length > 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No estimates match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleStatusChange("all");
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <EstimateEmptyState />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );
}
