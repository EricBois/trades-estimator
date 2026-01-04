"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { ProjectTradeType, getTradeDisplayInfo } from "@/lib/project/types";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { Check, Home, Layers, Square } from "lucide-react";

export function TradeRoomSelectionStep({
  tradeType,
  title,
  description,
}: {
  tradeType: ProjectTradeType;
  title?: string;
  description?: string;
}) {
  const { nextStep, previousStep, activeStep } = useWizard();
  const { setFooterConfig, lastVisitedStep } = useWizardFooter();
  const { roomsHook, getTradeRoomViews, setRoomOverride, syncSqftToTrades } =
    useProjectEstimateContext();

  const tradeInfo = getTradeDisplayInfo(tradeType);
  const tradeRooms = getTradeRoomViews(tradeType);

  // Check if we should skip this step (manual sqft mode or no rooms)
  const shouldSkip =
    roomsHook.inputMode !== "rooms" || roomsHook.rooms.length === 0;

  // Calculate effective totals for this trade
  const effectiveTotalSqft = tradeRooms.reduce(
    (sum, room) => sum + room.effectiveTotalSqft,
    0
  );
  const includedRoomCount = tradeRooms.filter((r) => !r.excluded).length;

  // Configure footer
  const handleContinue = useCallback(() => {
    // Sync sqft to trades before continuing
    syncSqftToTrades();
    nextStep();
  }, [nextStep, syncSqftToTrades]);

  // Auto-skip if in manual mode or no rooms - handle both forward and backward navigation
  useEffect(() => {
    if (shouldSkip) {
      // Determine navigation direction based on last visited step from context
      const goingBackward =
        lastVisitedStep !== null && lastVisitedStep > activeStep;

      if (goingBackward) {
        previousStep();
      } else {
        nextStep();
      }
    }
  }, [shouldSkip, nextStep, previousStep, activeStep, lastVisitedStep]);

  useEffect(() => {
    if (!shouldSkip) {
      setFooterConfig({
        onContinue: handleContinue,
        continueText: "Continue",
        disabled: includedRoomCount === 0,
      });
      return () => setFooterConfig(null);
    }
  }, [setFooterConfig, handleContinue, includedRoomCount, shouldSkip]);

  const handleToggleRoom = (roomId: string, excluded: boolean) => {
    setRoomOverride(roomId, tradeType, { excluded });
  };

  const handleToggleCeiling = (roomId: string, includeCeiling: boolean) => {
    setRoomOverride(roomId, tradeType, { includeCeiling });
  };

  const handleToggleWalls = (roomId: string, includeWalls: boolean) => {
    setRoomOverride(roomId, tradeType, { includeWalls });
  };

  // If using manual sqft mode, skip room selection
  if (shouldSkip) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title={title || `${tradeInfo.label} Rooms`}
        description={
          description ||
          `Select which rooms to include for ${tradeInfo.label.toLowerCase()}`
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">
                  {includedRoomCount} of {tradeRooms.length} rooms selected
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {effectiveTotalSqft.toFixed(0)} sqft
                </div>
              </div>
              <Home className="w-10 h-10 text-blue-300" />
            </div>
          </div>

          {/* Room list */}
          <div className="space-y-3">
            {tradeRooms.map((room) => {
              const isIncluded = !room.excluded;

              return (
                <div
                  key={room.id}
                  className={cn(
                    "rounded-xl border-2 transition-all",
                    isIncluded
                      ? "border-blue-500 bg-white"
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  {/* Room header with toggle */}
                  <button
                    onClick={() => handleToggleRoom(room.id, isIncluded)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          isIncluded
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 bg-white"
                        )}
                      >
                        {isIncluded && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="text-left">
                        <div
                          className={cn(
                            "font-medium",
                            isIncluded ? "text-gray-900" : "text-gray-500"
                          )}
                        >
                          {room.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {room.grossTotalSqft.toFixed(0)} sqft total
                        </div>
                      </div>
                    </div>
                    {isIncluded && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {room.effectiveTotalSqft.toFixed(0)} sqft
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Ceiling/Walls toggles - only show when included */}
                  {isIncluded && (
                    <div className="border-t border-gray-100 px-4 py-3 flex gap-4">
                      {/* Walls toggle */}
                      <button
                        onClick={() =>
                          handleToggleWalls(room.id, !room.includeWalls)
                        }
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all",
                          room.includeWalls
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        )}
                      >
                        <Square className="w-4 h-4" />
                        <span className="text-sm font-medium">Walls</span>
                        {room.includeWalls && (
                          <span className="text-xs">
                            ({room.wallSqft.toFixed(0)})
                          </span>
                        )}
                      </button>

                      {/* Ceiling toggle */}
                      <button
                        onClick={() =>
                          handleToggleCeiling(room.id, !room.includeCeiling)
                        }
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all",
                          room.includeCeiling
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        )}
                      >
                        <Layers className="w-4 h-4" />
                        <span className="text-sm font-medium">Ceiling</span>
                        {room.includeCeiling && (
                          <span className="text-xs">
                            ({room.ceilingSqft.toFixed(0)})
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Warning if no rooms selected */}
          {includedRoomCount === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <p className="text-orange-700 text-sm">
                Select at least one room to continue
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
