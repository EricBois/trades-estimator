"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import {
  Plus,
  Trash2,
  DoorOpen,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  AppWindow,
} from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { HangingOpeningsSheet } from "./HangingOpeningsSheet";
import { ShapeSelector } from "./ShapeSelector";
import { ShapeDimensionInputs } from "./ShapeDimensionInputs";
import { HangingRoom, WallSegment } from "@/lib/trades/drywallHanging/types";
import { StepHeader } from "@/components/ui/StepHeader";

interface RoomCardProps {
  room: HangingRoom;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<HangingRoom>) => void;
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
              {room.totalSqft.toFixed(0)} sqft
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
            room={room}
            onUpdate={onUpdate}
            onAddWall={onAddWall}
            onUpdateWall={onUpdateWall}
            onRemoveWall={onRemoveWall}
          />

          {/* Include ceiling toggle */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={room.includeCeiling}
              onChange={(e) => onUpdate({ includeCeiling: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Include ceiling</span>
            {room.includeCeiling && (
              <span className="text-sm text-gray-500 ml-auto">
                +{room.ceilingSqft.toFixed(0)} sqft
              </span>
            )}
          </label>

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
            {room.includeCeiling && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ceiling</span>
                <span className="text-gray-700">
                  {room.ceilingSqft.toFixed(0)} sqft
                </span>
              </div>
            )}
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

export function HangingRoomStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    rooms,
    addRoom,
    updateRoom,
    removeRoom,
    addOpening,
    removeOpening,
    addCustomWall,
    updateCustomWall,
    removeCustomWall,
  } = useHangingEstimate();

  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(
    rooms[0]?.id ?? null
  );
  const [openingSheet, setOpeningSheet] = useState<{
    isOpen: boolean;
    roomId: string;
    type: "doors" | "windows";
  }>({ isOpen: false, roomId: "", type: "doors" });

  const totalSqft = rooms.reduce((sum, room) => sum + room.totalSqft, 0);

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: rooms.length === 0 || totalSqft === 0,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, rooms.length, totalSqft]);

  const handleToggleExpand = (roomId: string) => {
    setExpandedRoomId(expandedRoomId === roomId ? null : roomId);
  };

  const handleAddRoom = () => {
    const newRoomId = addRoom();
    // Expand the newly added room
    setExpandedRoomId(newRoomId);
  };

  const handleAddOpening = (roomId: string, type: "doors" | "windows") => {
    setOpeningSheet({ isOpen: true, roomId, type });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Room Dimensions"
        description="Enter room measurements to calculate drywall needed"
      />

      {/* Rooms */}
      <div className="space-y-3 mb-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isExpanded={expandedRoomId === room.id}
            onToggleExpand={() => handleToggleExpand(room.id)}
            onUpdate={(updates) => updateRoom(room.id, updates)}
            onRemove={() => removeRoom(room.id)}
            onAddOpening={(type) => handleAddOpening(room.id, type)}
            onRemoveOpening={(openingId) => removeOpening(room.id, openingId)}
            onAddWall={() => addCustomWall(room.id)}
            onUpdateWall={(wallId, updates) =>
              updateCustomWall(room.id, wallId, updates)
            }
            onRemoveWall={(wallId) => removeCustomWall(room.id, wallId)}
          />
        ))}
      </div>

      {/* Add room button */}
      <button
        onClick={handleAddRoom}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Another Room</span>
      </button>

      {/* Total summary */}
      {rooms.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-600 font-medium">Total Area</span>
            <span className="text-2xl font-bold text-blue-900">
              {totalSqft.toFixed(0)} sqft
            </span>
          </div>
        </div>
      )}

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
