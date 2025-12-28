"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FilePlus, Search, Filter, X } from "lucide-react";
import { Layout } from "@/components/layout";
import { EstimateCard, EstimateEmptyState } from "@/components/estimates";
import { ESTIMATE_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Estimate } from "@/hooks";

interface EstimatesContentProps {
  estimates: Estimate[];
  initialStatus: string;
}

export function EstimatesContent({ estimates, initialStatus }: EstimatesContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const filteredEstimates = useMemo(() => {
    return estimates.filter((estimate) => {
      // Status filter
      if (statusFilter !== "all" && estimate.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          estimate.homeownerName.toLowerCase().includes(query) ||
          estimate.homeownerEmail.toLowerCase().includes(query) ||
          estimate.projectDescription?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [estimates, statusFilter, searchQuery]);

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
              {estimates.length} total estimates
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
          {filteredEstimates.length > 0 ? (
            filteredEstimates.map((estimate) => (
              <EstimateCard key={estimate.id} estimate={estimate} />
            ))
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
