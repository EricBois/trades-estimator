"use client";

import {
  HangingRoom,
  LShapeDimensions,
  WallSegment,
} from "@/lib/trades/drywallHanging/types";
import { CustomWallsList } from "./CustomWallsList";

interface ShapeDimensionInputsProps {
  room: HangingRoom;
  onUpdate: (updates: Partial<HangingRoom>) => void;
  onAddWall: () => void;
  onUpdateWall: (
    wallId: string,
    updates: Partial<Omit<WallSegment, "id" | "sqft">>
  ) => void;
  onRemoveWall: (wallId: string) => void;
}

interface DimensionInputProps {
  label: string;
  feet: number;
  inches: number;
  onFeetChange: (value: number) => void;
  onInchesChange: (value: number) => void;
}

function DimensionInput({
  label,
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}: DimensionInputProps) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={feet}
          onChange={(e) => onFeetChange(parseInt(e.target.value) || 0)}
          className="w-full h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
        />
        <span className="h-12 px-2 flex items-center bg-gray-100 border-y-2 border-gray-200 text-gray-500 text-sm">
          ft
        </span>
        <input
          type="number"
          value={inches}
          onChange={(e) => onInchesChange(parseInt(e.target.value) || 0)}
          className="w-12 h-12 text-center text-lg font-semibold border-2 border-l-0 border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
          max="11"
        />
      </div>
    </div>
  );
}

function RectangularInputs({
  room,
  onUpdate,
}: {
  room: HangingRoom;
  onUpdate: (updates: Partial<HangingRoom>) => void;
}) {
  return (
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
  );
}

function LShapeInputs({
  room,
  onUpdate,
}: {
  room: HangingRoom;
  onUpdate: (updates: Partial<HangingRoom>) => void;
}) {
  const dims = room.lShapeDimensions || {
    mainLengthFeet: 12,
    mainLengthInches: 0,
    mainWidthFeet: 10,
    mainWidthInches: 0,
    extLengthFeet: 8,
    extLengthInches: 0,
    extWidthFeet: 6,
    extWidthInches: 0,
  };

  const updateDims = (updates: Partial<LShapeDimensions>) => {
    onUpdate({
      lShapeDimensions: { ...dims, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      {/* Main section */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">
          Main Section
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DimensionInput
            label="Length"
            feet={dims.mainLengthFeet}
            inches={dims.mainLengthInches}
            onFeetChange={(v) => updateDims({ mainLengthFeet: v })}
            onInchesChange={(v) => updateDims({ mainLengthInches: v })}
          />
          <DimensionInput
            label="Width"
            feet={dims.mainWidthFeet}
            inches={dims.mainWidthInches}
            onFeetChange={(v) => updateDims({ mainWidthFeet: v })}
            onInchesChange={(v) => updateDims({ mainWidthInches: v })}
          />
        </div>
      </div>

      {/* Extension section */}
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Extension</div>
        <div className="grid grid-cols-2 gap-3">
          <DimensionInput
            label="Length"
            feet={dims.extLengthFeet}
            inches={dims.extLengthInches}
            onFeetChange={(v) => updateDims({ extLengthFeet: v })}
            onInchesChange={(v) => updateDims({ extLengthInches: v })}
          />
          <DimensionInput
            label="Width"
            feet={dims.extWidthFeet}
            inches={dims.extWidthInches}
            onFeetChange={(v) => updateDims({ extWidthFeet: v })}
            onInchesChange={(v) => updateDims({ extWidthInches: v })}
          />
        </div>
      </div>

      {/* Shared height */}
      <div className="grid grid-cols-3 gap-3">
        <DimensionInput
          label="Wall Height"
          feet={room.heightFeet}
          inches={room.heightInches}
          onFeetChange={(v) => onUpdate({ heightFeet: v })}
          onInchesChange={(v) => onUpdate({ heightInches: v })}
        />
      </div>
    </div>
  );
}

export function ShapeDimensionInputs({
  room,
  onUpdate,
  onAddWall,
  onUpdateWall,
  onRemoveWall,
}: ShapeDimensionInputsProps) {
  const shape = room.shape || "rectangular";

  switch (shape) {
    case "l_shape":
      return <LShapeInputs room={room} onUpdate={onUpdate} />;

    case "custom":
      return (
        <CustomWallsList
          room={room}
          onUpdate={onUpdate}
          onAddWall={onAddWall}
          onUpdateWall={onUpdateWall}
          onRemoveWall={onRemoveWall}
        />
      );

    case "rectangular":
    default:
      return <RectangularInputs room={room} onUpdate={onUpdate} />;
  }
}
