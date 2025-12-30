"use client";

import { RotateCcw } from "lucide-react";

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onReset?: () => void;
  children: React.ReactNode;
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  onReset,
  children,
}: SettingsSectionProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
