"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Clock,
  DollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useDeleteTemplate } from "@/hooks";
import type { Template } from "@/hooks";
import { TRADE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TemplatesContentProps {
  templates: Template[];
  profileId: string | null;
}

export function TemplatesContent({
  templates,
  profileId,
}: TemplatesContentProps) {
  const router = useRouter();
  const deleteTemplate = useDeleteTemplate();

  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique trade types from templates
  const tradeTypes = useMemo(() => {
    const types = [...new Set(templates.map((t) => t.tradeType))];
    return types.sort();
  }, [templates]);

  // Filter templates by selected trade
  const filteredTemplates = useMemo(() => {
    if (!selectedTrade) return templates;
    return templates.filter((t) => t.tradeType === selectedTrade);
  }, [templates, selectedTrade]);

  // Group templates by trade type
  const templatesByTrade = useMemo(() => {
    return filteredTemplates.reduce(
      (acc, template) => {
        const trade = template.tradeType;
        if (!acc[trade]) acc[trade] = [];
        acc[trade].push(template);
        return acc;
      },
      {} as Record<string, typeof filteredTemplates>
    );
  }, [filteredTemplates]);

  const formatTradeType = (trade: string) => {
    const found = TRADE_TYPES.find((t) => t.value === trade);
    return found?.label ?? trade.charAt(0).toUpperCase() + trade.slice(1);
  };

  const openDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      closeDeleteModal();
      router.refresh();
    } catch (error) {
      console.error("Failed to delete template:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-500">
              Manage estimate templates and visibility
            </p>
          </div>
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Link>
        </div>

        {/* Trade Filter */}
        {tradeTypes.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTrade(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                selectedTrade === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Trades
            </button>
            {tradeTypes.map((trade) => (
              <button
                key={trade}
                onClick={() => setSelectedTrade(trade)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  selectedTrade === trade
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {formatTradeType(trade)}
              </button>
            ))}
          </div>
        )}

        {/* Templates List */}
        {Object.keys(templatesByTrade).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first custom template to get started.
            </p>
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(templatesByTrade).map(([trade, tradeTemplates]) => (
              <section key={trade}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {formatTradeType(trade)}
                </h2>
                <div className="space-y-3">
                  {tradeTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 p-5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {template.templateName}
                          </h3>
                          {template.description && (
                            <p className="text-sm text-gray-500 mb-3">
                              {template.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {template.baseLaborHours} hrs base
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              ${template.baseMaterialCost} materials
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/templates/${template.id}/edit`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit template"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(template)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.templateName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
}
