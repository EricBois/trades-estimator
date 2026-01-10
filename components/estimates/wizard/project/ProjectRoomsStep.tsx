"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import {
  Plus,
  LayoutGrid,
  Trash2,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { StepHeader } from "@/components/ui/StepHeader";
import { ShapeSelector } from "../trades/hanging/ShapeSelector";
import { ShapeDimensionInputs } from "../trades/hanging/ShapeDimensionInputs";
import { HangingOpeningsSheet } from "../trades/hanging/HangingOpeningsSheet";
import { ProjectRoom, WallSegment } from "@/lib/project/types";
import { ZodForm } from "@/components/ui/ZodForm";

const projectRoomsSchema = z.object({}).passthrough();

interface RoomCardProps {
  room: ProjectRoom;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ProjectRoom>) => void;
  onRemove: () => void;
  onAddOpening: (type: "doors" | "windows") => void;
  onRemoveOpening: (openingId: string) => void;
  onAddWall: () => void;
  onUpdateWall: (
    wallId: string,
    updates: Partial<Omit<WallSegment, "id" | "sqft">>
  ) => void;
  onRemoveWall: (wallId: string) => void;
}

function RoomCard({
  room,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddOpening,
  onRemoveOpening,
  onAddWall,
  onUpdateWall,
  onRemoveWall,
}: RoomCardProps) {
  // Adapt ProjectRoom to HangingRoom format for ShapeDimensionInputs
  const hangingRoomAdapter = {
    ...room,
    shape: room.shape || "rectangular",
    includeCeiling: true,
  };

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
              value={room.shape || "rectangular"}
              onChange={(shape) => onUpdate({ shape })}
            />
          </div>

          {/* Dimensions based on shape */}
          <ShapeDimensionInputs
            room={hangingRoomAdapter}
            onUpdate={onUpdate}
            onAddWall={onAddWall}
            onUpdateWall={onUpdateWall}
            onRemoveWall={onRemoveWall}
          />

          {/* Openings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Openings
              </span>
              {room.openingsSqft > 0 && (
                <span className="text-sm text-gray-500">
                  -{room.openingsSqft.toFixed(0)} sqft
                </span>
              )}
            </div>

            {/* List of openings */}
            {(room.doors.length > 0 || room.windows.length > 0) && (
              <div className="space-y-2 mb-3">
                {room.doors.map((door) => (
                  <div
                    key={door.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {door.label}
                      </span>
                      {door.quantity > 1 && (
                        <span className="text-xs text-gray-500">
                          ×{door.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        -{door.totalSqft.toFixed(0)} sqft
                      </span>
                      <button
                        onClick={() => onRemoveOpening(door.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {room.windows.map((window) => (
                  <div
                    key={window.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AppWindow className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {window.label}
                      </span>
                      {window.quantity > 1 && (
                        <span className="text-xs text-gray-500">
                          ×{window.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        -{window.totalSqft.toFixed(0)} sqft
                      </span>
                      <button
                        onClick={() => onRemoveOpening(window.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add opening buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onAddOpening("doors")}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Door</span>
              </button>
              <button
                onClick={() => onAddOpening("windows")}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Window</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Walls</span>
              <span className="text-gray-700">
                {room.wallSqft.toFixed(0)} sqft
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ceiling</span>
              <span className="text-gray-700">
                {room.ceilingSqft.toFixed(0)} sqft
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium mt-1 pt-1 border-t border-gray-100">
              <span className="text-gray-700">Total</span>
              <span className="text-blue-600">
                {room.totalSqft.toFixed(0)} sqft
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component that provides ZodForm context
export function ProjectRoomsStep() {
  return (
    <ZodForm
      schema={projectRoomsSchema}
      defaultValues={{}}
    >
      <ProjectRoomsStepContent />
    </ZodForm>
  );
}

// Content component
function ProjectRoomsStepContent() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { roomsHook, hangingEstimate, finishingEstimate, paintingEstimate } =
    useProjectEstimateContext();

  const {
    rooms,
    totalSqft,
    totalWallSqft,
    totalCeilingSqft,
    addRoom,
    updateRoom,
    removeRoom,
    addOpening,
    removeOpening,
    addCustomWall,
    updateCustomWall,
    removeCustomWall,
    inputMode,
    setInputMode,
    manualWallSqft,
    manualCeilingSqft,
    setManualWallSqft,
    setManualCeilingSqft,
    reset: resetRooms,
  } = roomsHook;

  // Handle mode change - clear all data when switching to avoid confusing UI
  const handleModeChange = (newMode: "rooms" | "manual") => {
    if (newMode !== inputMode) {
      // Clear room/sqft data based on what mode we're leaving
      if (inputMode === "rooms") {
        resetRooms(); // Clear rooms
      } else if (inputMode === "manual") {
        setManualWallSqft(0);
        setManualCeilingSqft(0);
      }

      // Reset all trade estimates to clear costs
      hangingEstimate.reset();
      finishingEstimate.reset();
      paintingEstimate.reset();

      setInputMode(newMode);
    }
  };

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(
    rooms[0]?.id ?? null
  );
  const [openingSheet, setOpeningSheet] = useState<{
    isOpen: boolean;
    roomId: string;
    type: "doors" | "windows";
  }>({ isOpen: false, roomId: "", type: "doors" });

  const handleAddRoom = () => {
    const newRoomId = addRoom();
    setExpandedRoomId(newRoomId);
  };

  const handleAddOpening = (roomId: string, type: "doors" | "windows") => {
    setOpeningSheet({ isOpen: true, roomId, type });
  };

  // Can continue if we have sqft (rooms or manual)
  const canContinue =
    inputMode === "rooms"
      ? rooms.length > 0 && totalSqft > 0
      : totalWallSqft > 0 || totalCeilingSqft > 0;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: !canContinue,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, canContinue]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Project Area"
        description="Enter the square footage for this project"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Input Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to estimate this project?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModeChange("rooms")}
                className={cn(
                  "p-3 rounded-xl border-2 text-center transition-all",
                  inputMode === "rooms"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <LayoutGrid className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="font-medium text-gray-900 text-sm">Rooms</div>
                <div className="text-xs text-gray-500">Enter dimensions</div>
              </button>
              <button
                onClick={() => handleModeChange("manual")}
                className={cn(
                  "p-3 rounded-xl border-2 text-center transition-all",
                  inputMode === "manual"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <svg
                  className="w-5 h-5 mx-auto mb-1 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div className="font-medium text-gray-900 text-sm">Sqft</div>
                <div className="text-xs text-gray-500">Enter directly</div>
              </button>
            </div>
          </div>

          {/* Manual Sqft Entry */}
          {inputMode === "manual" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wall Square Footage
                </label>
                <input
                  type="number"
                  value={manualWallSqft || ""}
                  onChange={(e) =>
                    setManualWallSqft(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter wall sqft"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ceiling Square Footage
                </label>
                <input
                  type="number"
                  value={manualCeilingSqft || ""}
                  onChange={(e) =>
                    setManualCeilingSqft(parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter ceiling sqft"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>
            </div>
          )}

          {/* Room Entry */}
          {inputMode === "rooms" && (
            <div className="space-y-3">
              {/* Room list */}
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isExpanded={expandedRoomId === room.id}
                  onToggleExpand={() =>
                    setExpandedRoomId(
                      expandedRoomId === room.id ? null : room.id
                    )
                  }
                  onUpdate={(updates) => updateRoom(room.id, updates)}
                  onRemove={() => removeRoom(room.id)}
                  onAddOpening={(type) => handleAddOpening(room.id, type)}
                  onRemoveOpening={(openingId) =>
                    removeOpening(room.id, openingId)
                  }
                  onAddWall={() => addCustomWall(room.id)}
                  onUpdateWall={(wallId, updates) =>
                    updateCustomWall(room.id, wallId, updates)
                  }
                  onRemoveWall={(wallId) => removeCustomWall(room.id, wallId)}
                />
              ))}

              {/* Add room button */}
              <button
                onClick={handleAddRoom}
                className={cn(
                  "w-full flex items-center justify-center gap-2 p-4",
                  "border-2 border-dashed border-gray-300 rounded-xl",
                  "text-gray-500 hover:border-blue-500 hover:text-blue-500",
                  "transition-colors"
                )}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Room</span>
              </button>
            </div>
          )}

          {/* Summary */}
          {totalSqft > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <div className="text-sm text-blue-800 font-medium mb-2">
                Project Summary
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {totalWallSqft.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600">Wall sqft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {totalCeilingSqft.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600">Ceiling sqft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {totalSqft.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600">Total sqft</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Opening sheet */}
      <HangingOpeningsSheet
        isOpen={openingSheet.isOpen}
        onClose={() => setOpeningSheet({ ...openingSheet, isOpen: false })}
        roomId={openingSheet.roomId}
        type={openingSheet.type}
        onAddOpening={(presetId, quantity) => {
          addOpening(
            openingSheet.roomId,
            openingSheet.type,
            presetId,
            quantity
          );
          setOpeningSheet({ ...openingSheet, isOpen: false });
        }}
      />
    </div>
  );
}
