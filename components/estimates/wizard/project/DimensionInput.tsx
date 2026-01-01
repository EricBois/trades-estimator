"use client";

export function DimensionInput({
  label,
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}: {
  label: string;
  feet: number;
  inches: number;
  onFeetChange: (value: number) => void;
  onInchesChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="flex items-center">
            <input
              type="number"
              value={feet}
              onChange={(e) => onFeetChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={0}
            />
            <span className="ml-2 text-sm text-gray-500">ft</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <input
              type="number"
              value={inches}
              onChange={(e) => onInchesChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={0}
              max={11}
            />
            <span className="ml-2 text-sm text-gray-500">in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
