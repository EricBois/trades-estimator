"use client";

import { Square, CornerUpRight, Layers } from "lucide-react";
import { RoomShape } from "@/lib/trades/drywallHanging/types";
import { ROOM_SHAPES } from "@/lib/trades/drywallHanging/constants";

interface ShapeSelectorProps {
  value: RoomShape;
  onChange: (shape: RoomShape) => void;
}

const SHAPE_ICONS = {
  Square,
  CornerUpRight,
  Layers,
};

export function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  return (
    <div className="flex gap-2">
      {ROOM_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape.icon as keyof typeof SHAPE_ICONS];
        const isSelected = value === shape.value;

        return (
          <button
            key={shape.value}
            type="button"
            onClick={() => onChange(shape.value as RoomShape)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg border-2 transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{shape.label}</span>
          </button>
        );
      })}
    </div>
  );
}
