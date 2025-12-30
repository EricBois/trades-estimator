"use client";

import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditButtonProps {
  onClick: () => void;
  className?: string;
}

export function EditButton({ onClick, className }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn("text-blue-600 hover:text-blue-700 p-1", className)}
    >
      <Edit2 className="w-4 h-4" />
    </button>
  );
}
