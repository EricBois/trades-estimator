"use client";

import { useState } from "react";
import { useWizard } from "react-use-wizard";
import { Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { StepHeader } from "@/components/ui/StepHeader";
import { WizardButton } from "@/components/ui/WizardButton";
import { RoomCard } from "./RoomCard";

export function ProjectRoomsStep() {
  const { nextStep } = useWizard();
  const { roomsHook } = useProjectEstimateContext();
  const {
    rooms,
    totalSqft,
    totalWallSqft,
    totalCeilingSqft,
    addRoom,
    updateRoom,
    removeRoom,
    inputMode,
    setInputMode,
    manualWallSqft,
    manualCeilingSqft,
    setManualWallSqft,
    setManualCeilingSqft,
  } = roomsHook;

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  const handleAddRoom = () => {
    const newRoomId = addRoom();
    setExpandedRoomId(newRoomId);
  };

  // Can continue if we have sqft either way
  const canContinue =
    inputMode === "rooms"
      ? rooms.length > 0 && totalSqft > 0
      : totalWallSqft > 0 || totalCeilingSqft > 0;

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
              How would you like to enter square footage?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setInputMode("rooms")}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  inputMode === "rooms"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="font-medium text-gray-900">Add Rooms</div>
                <div className="text-xs text-gray-500">
                  Enter room dimensions
                </div>
              </button>
              <button
                onClick={() => setInputMode("manual")}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  inputMode === "manual"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <svg
                  className="w-6 h-6 mx-auto mb-2 text-gray-600"
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
                <div className="font-medium text-gray-900">Enter Sqft</div>
                <div className="text-xs text-gray-500">
                  Enter total sqft directly
                </div>
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

      <div className="px-4 pb-4">
        <WizardButton
          onClick={nextStep}
          disabled={!canContinue}
          className="w-full max-w-lg mx-auto"
        >
          Continue
        </WizardButton>
      </div>
    </div>
  );
}
