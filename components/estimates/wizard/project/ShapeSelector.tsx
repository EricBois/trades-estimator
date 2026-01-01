"use client";

import { cn } from "@/lib/utils";
import { ProjectRoomShape } from "@/lib/project/types";

export function ShapeSelector({
  value,
  onChange,
}: {
  value: ProjectRoomShape;
  onChange: (shape: ProjectRoomShape) => void;
}) {
  const shapes: { value: ProjectRoomShape; label: string }[] = [
    { value: "rectangular", label: "Rectangle" },
    { value: "l_shape", label: "L-Shape" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="flex gap-2">
      {shapes.map((shape) => (
        <button
          key={shape.value}
          onClick={() => onChange(shape.value)}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
            value === shape.value
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {shape.label}
        </button>
      ))}
    </div>
  );
}
