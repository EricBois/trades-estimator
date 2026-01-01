"use client";

import { Plus, Trash2 } from "lucide-react";
import { HangingRoom, WallSegment } from "@/lib/trades/drywallHanging/types";
import { feetInchesToFeet } from "@/lib/trades/drywallHanging/calculator";

interface CustomWallsListProps {
  room: HangingRoom;
  onUpdate: (updates: Partial<HangingRoom>) => void;
  onAddWall: () => void;
  onUpdateWall: (
    wallId: string,
    updates: Partial<Omit<WallSegment, "id" | "sqft">>
  ) => void;
  onRemoveWall: (wallId: string) => void;
}

export function CustomWallsList({
  room,
  onUpdate,
  onAddWall,
  onUpdateWall,
  onRemoveWall,
}: CustomWallsListProps) {
  const height = feetInchesToFeet(room.heightFeet, room.heightInches);

  return (
    <div className="space-y-4">
      {/* Shared height */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Wall Height (all walls)
        </label>
        <div className="flex items-center w-40">
          <input
            type="number"
            value={room.heightFeet}
            onChange={(e) =>
              onUpdate({ heightFeet: parseInt(e.target.value) || 0 })
            }
            className="w-full h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
          />
          <span className="h-12 px-2 flex items-center bg-gray-100 border-y-2 border-gray-200 text-gray-500 text-sm">
            ft
          </span>
          <input
            type="number"
            value={room.heightInches}
            onChange={(e) =>
              onUpdate({ heightInches: parseInt(e.target.value) || 0 })
            }
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-l-0 border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="11"
          />
        </div>
      </div>

      {/* Walls list */}
      <div className="space-y-2">
        {room.customWalls.map((wall) => {
          const wallLength = feetInchesToFeet(
            wall.lengthFeet,
            wall.lengthInches
          );
          const wallSqft = wallLength * height;

          return (
            <div
              key={wall.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <input
                type="text"
                value={wall.label}
                onChange={(e) =>
                  onUpdateWall(wall.id, { label: e.target.value })
                }
                className="w-24 text-sm font-medium bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                placeholder="Wall name"
              />

              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-gray-500">Length:</span>
                <input
                  type="number"
                  value={wall.lengthFeet}
                  onChange={(e) =>
                    onUpdateWall(wall.id, {
                      lengthFeet: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-14 h-9 text-center text-sm font-semibold border-2 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <span className="h-9 px-1.5 flex items-center bg-gray-100 border-y-2 border-gray-200 text-gray-500 text-xs">
                  ft
                </span>
                <input
                  type="number"
                  value={wall.lengthInches}
                  onChange={(e) =>
                    onUpdateWall(wall.id, {
                      lengthInches: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-10 h-9 text-center text-sm font-semibold border-2 border-l-0 border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="11"
                />
              </div>

              <span className="text-sm text-gray-500 min-w-15 text-right">
                {wallSqft.toFixed(0)} sqft
              </span>

              <button
                onClick={() => onRemoveWall(wall.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                disabled={room.customWalls.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add wall button */}
      <button
        onClick={onAddWall}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add Wall</span>
      </button>

      {/* Ceiling sqft input (when ceiling is included) */}
      {room.includeCeiling && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Ceiling Area (sqft)
          </label>
          <input
            type="number"
            value={room.customCeilingSqft || 0}
            onChange={(e) =>
              onUpdate({ customCeilingSqft: parseFloat(e.target.value) || 0 })
            }
            className="w-32 h-10 text-center font-semibold border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.1"
            placeholder="Enter sqft"
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter ceiling area manually for custom shapes
          </p>
        </div>
      )}
    </div>
  );
}
