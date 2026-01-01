"use client";

import {
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  AppWindow,
  Trash2,
} from "lucide-react";
import { ProjectRoom } from "@/lib/project/types";
import { ShapeSelector } from "./ShapeSelector";
import { DimensionInput } from "./DimensionInput";

export function RoomCard({
  room,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: {
  room: ProjectRoom;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProjectRoom>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Room header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-gray-400" />
          <div>
            <input
              type="text"
              value={room.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
            />
            <div className="text-sm text-gray-500">
              {room.totalSqft.toFixed(0)} sqft (walls:{" "}
              {room.wallSqft.toFixed(0)}, ceiling: {room.ceilingSqft.toFixed(0)}
              )
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Room Shape Selector */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Room Shape
            </label>
            <ShapeSelector
              value={room.shape}
              onChange={(shape) => onUpdate({ shape })}
            />
          </div>

          {/* Dimensions */}
          {room.shape === "rectangular" && (
            <div className="grid grid-cols-3 gap-3">
              <DimensionInput
                label="Length"
                feet={room.lengthFeet}
                inches={room.lengthInches}
                onFeetChange={(v) => onUpdate({ lengthFeet: v })}
                onInchesChange={(v) => onUpdate({ lengthInches: v })}
              />
              <DimensionInput
                label="Width"
                feet={room.widthFeet}
                inches={room.widthInches}
                onFeetChange={(v) => onUpdate({ widthFeet: v })}
                onInchesChange={(v) => onUpdate({ widthInches: v })}
              />
              <DimensionInput
                label="Height"
                feet={room.heightFeet}
                inches={room.heightInches}
                onFeetChange={(v) => onUpdate({ heightFeet: v })}
                onInchesChange={(v) => onUpdate({ heightInches: v })}
              />
            </div>
          )}

          {room.shape === "l_shape" && room.lShapeDimensions && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Section
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <DimensionInput
                    label="Length"
                    feet={room.lShapeDimensions.mainLengthFeet}
                    inches={room.lShapeDimensions.mainLengthInches}
                    onFeetChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          mainLengthFeet: v,
                        },
                      })
                    }
                    onInchesChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          mainLengthInches: v,
                        },
                      })
                    }
                  />
                  <DimensionInput
                    label="Width"
                    feet={room.lShapeDimensions.mainWidthFeet}
                    inches={room.lShapeDimensions.mainWidthInches}
                    onFeetChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          mainWidthFeet: v,
                        },
                      })
                    }
                    onInchesChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          mainWidthInches: v,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <DimensionInput
                    label="Length"
                    feet={room.lShapeDimensions.extLengthFeet}
                    inches={room.lShapeDimensions.extLengthInches}
                    onFeetChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          extLengthFeet: v,
                        },
                      })
                    }
                    onInchesChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          extLengthInches: v,
                        },
                      })
                    }
                  />
                  <DimensionInput
                    label="Width"
                    feet={room.lShapeDimensions.extWidthFeet}
                    inches={room.lShapeDimensions.extWidthInches}
                    onFeetChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          extWidthFeet: v,
                        },
                      })
                    }
                    onInchesChange={(v) =>
                      onUpdate({
                        lShapeDimensions: {
                          ...room.lShapeDimensions!,
                          extWidthInches: v,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <DimensionInput
                label="Ceiling Height"
                feet={room.heightFeet}
                inches={room.heightInches}
                onFeetChange={(v) => onUpdate({ heightFeet: v })}
                onInchesChange={(v) => onUpdate({ heightInches: v })}
              />
            </div>
          )}

          {/* Openings summary */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <DoorOpen className="w-4 h-4" />
                <span className="text-sm">{room.doors.length} doors</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <AppWindow className="w-4 h-4" />
                <span className="text-sm">{room.windows.length} windows</span>
              </div>
            </div>
            {room.openingsSqft > 0 && (
              <span className="text-sm text-gray-500">
                -{room.openingsSqft.toFixed(0)} sqft
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
