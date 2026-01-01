"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  ProjectRoom,
  ProjectOpening,
  WallSegment,
  ProjectRoomShape,
  LShapeDimensions,
  createDefaultRoom,
} from "@/lib/project/types";
import { calculateRoomSqft } from "@/lib/trades/drywallHanging/calculator";
import { getOpeningPreset } from "@/lib/trades/drywallHanging/constants";
import { Tables, TablesInsert, TablesUpdate, Json } from "@/lib/database.types";

const supabase = createClient();

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// Convert database row to ProjectRoom
function toProjectRoom(row: Tables<"project_rooms">): ProjectRoom {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    shape: row.shape as ProjectRoomShape,
    lengthFeet: row.length_feet ?? 0,
    lengthInches: row.length_inches ?? 0,
    widthFeet: row.width_feet ?? 0,
    widthInches: row.width_inches ?? 0,
    heightFeet: row.height_feet ?? 8,
    heightInches: row.height_inches ?? 0,
    lShapeDimensions: row.l_shape_dimensions as unknown as
      | LShapeDimensions
      | undefined,
    customWalls: (row.custom_walls as unknown as WallSegment[]) ?? [],
    customCeilingSqft: row.custom_ceiling_sqft ?? undefined,
    doors: (row.doors as unknown as ProjectOpening[]) ?? [],
    windows: (row.windows as unknown as ProjectOpening[]) ?? [],
    wallSqft: row.wall_sqft ?? 0,
    ceilingSqft: row.ceiling_sqft ?? 0,
    openingsSqft: row.openings_sqft ?? 0,
    totalSqft: row.total_sqft ?? 0,
    sortOrder: row.sort_order ?? 0,
  };
}

// Convert ProjectRoom to database insert
function toDbInsert(room: ProjectRoom): TablesInsert<"project_rooms"> {
  return {
    id: room.id,
    project_id: room.projectId,
    name: room.name,
    shape: room.shape,
    length_feet: room.lengthFeet,
    length_inches: room.lengthInches,
    width_feet: room.widthFeet,
    width_inches: room.widthInches,
    height_feet: room.heightFeet,
    height_inches: room.heightInches,
    l_shape_dimensions: room.lShapeDimensions as unknown as Json,
    custom_walls: room.customWalls as unknown as Json,
    custom_ceiling_sqft: room.customCeilingSqft,
    doors: room.doors as unknown as Json,
    windows: room.windows as unknown as Json,
    wall_sqft: room.wallSqft,
    ceiling_sqft: room.ceilingSqft,
    openings_sqft: room.openingsSqft,
    total_sqft: room.totalSqft,
    sort_order: room.sortOrder,
  };
}

// Fetch rooms for a project from database
export function useProjectRoomsQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-rooms", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("project_rooms")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toProjectRoom);
    },
    enabled: !!projectId,
  });
}

// Input mode type
export type ProjectInputMode = "rooms" | "manual";

// Hook for managing rooms in memory with persistence
export function useProjectRooms(projectId: string) {
  const queryClient = useQueryClient();
  const [rooms, setRooms] = useState<ProjectRoom[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Input mode: "rooms" or "manual"
  const [inputMode, setInputMode] = useState<ProjectInputMode>("rooms");

  // Manual sqft values
  const [manualWallSqft, setManualWallSqft] = useState(0);
  const [manualCeilingSqft, setManualCeilingSqft] = useState(0);

  // Helper to recalculate room dimensions
  const recalculateRoom = useCallback((room: ProjectRoom): ProjectRoom => {
    // Convert ProjectRoom to HangingRoom format for calculation
    const hangingRoom = {
      ...room,
      includeCeiling: true, // Always calculate ceiling sqft
    };
    const calculated = calculateRoomSqft(hangingRoom);
    return {
      ...room,
      wallSqft: calculated.wallSqft,
      ceilingSqft: calculated.ceilingSqft,
      openingsSqft: calculated.openingsSqft,
      totalSqft: calculated.totalSqft,
    };
  }, []);

  // Add a new room
  const addRoom = useCallback(
    (name?: string, shape: ProjectRoomShape = "rectangular"): string => {
      const roomNumber = rooms.length + 1;
      const newRoom = createDefaultRoom(
        projectId,
        name ?? `Room ${roomNumber}`,
        roomNumber - 1
      );
      newRoom.shape = shape;
      if (shape === "l_shape") {
        newRoom.lShapeDimensions = {
          mainLengthFeet: 12,
          mainLengthInches: 0,
          mainWidthFeet: 10,
          mainWidthInches: 0,
          extLengthFeet: 8,
          extLengthInches: 0,
          extWidthFeet: 6,
          extWidthInches: 0,
        };
      }
      const calculatedRoom = recalculateRoom(newRoom);
      setRooms((prev) => [...prev, calculatedRoom]);
      setIsDirty(true);
      return calculatedRoom.id;
    },
    [projectId, rooms.length, recalculateRoom]
  );

  // Update a room
  const updateRoom = useCallback(
    (id: string, updates: Partial<ProjectRoom>) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== id) return room;
          const updatedRoom = { ...room, ...updates };

          // Initialize L-shape dimensions when switching to L-shape
          if (updates.shape === "l_shape" && !updatedRoom.lShapeDimensions) {
            updatedRoom.lShapeDimensions = {
              mainLengthFeet: 12,
              mainLengthInches: 0,
              mainWidthFeet: 10,
              mainWidthInches: 0,
              extLengthFeet: 8,
              extLengthInches: 0,
              extWidthFeet: 6,
              extWidthInches: 0,
            };
          }

          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Remove a room
  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== id));
    setIsDirty(true);
  }, []);

  // Reorder rooms
  const reorderRooms = useCallback((roomIds: string[]) => {
    setRooms((prev) => {
      const roomMap = new Map(prev.map((r) => [r.id, r]));
      return roomIds
        .map((id, index) => {
          const room = roomMap.get(id);
          return room ? { ...room, sortOrder: index } : null;
        })
        .filter((r): r is ProjectRoom => r !== null);
    });
    setIsDirty(true);
  }, []);

  // Add opening (door or window)
  const addOpening = useCallback(
    (
      roomId: string,
      type: "doors" | "windows",
      presetId: string,
      quantity: number = 1
    ) => {
      const preset = getOpeningPreset(type, presetId);
      if (!preset) return;

      const sqft = (preset.width * preset.height) / 144;
      const opening: ProjectOpening = {
        id: generateId(),
        presetId,
        label: preset.label,
        width: preset.width,
        height: preset.height,
        quantity,
        sqft,
        totalSqft: sqft * quantity,
      };

      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            [type]: [...room[type], opening],
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Add custom opening
  const addCustomOpening = useCallback(
    (
      roomId: string,
      type: "doors" | "windows",
      width: number,
      height: number,
      label: string,
      quantity: number = 1
    ) => {
      const sqft = (width * height) / 144;
      const opening: ProjectOpening = {
        id: generateId(),
        presetId: "custom",
        label,
        width,
        height,
        quantity,
        sqft,
        totalSqft: sqft * quantity,
      };

      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            [type]: [...room[type], opening],
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Update opening
  const updateOpening = useCallback(
    (roomId: string, openingId: string, updates: Partial<ProjectOpening>) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          const updateOpenings = (openings: ProjectOpening[]) =>
            openings.map((o) => {
              if (o.id !== openingId) return o;
              const updated = { ...o, ...updates };
              updated.sqft = (updated.width * updated.height) / 144;
              updated.totalSqft = updated.sqft * updated.quantity;
              return updated;
            });

          const updatedRoom = {
            ...room,
            doors: updateOpenings(room.doors),
            windows: updateOpenings(room.windows),
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Remove opening
  const removeOpening = useCallback(
    (roomId: string, openingId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            doors: room.doors.filter((d) => d.id !== openingId),
            windows: room.windows.filter((w) => w.id !== openingId),
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Add custom wall
  const addCustomWall = useCallback(
    (roomId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const wallNumber = room.customWalls.length + 1;
          const newWall: WallSegment = {
            id: generateId(),
            lengthFeet: 10,
            lengthInches: 0,
            label: `Wall ${wallNumber}`,
            sqft: 0,
          };
          const updatedRoom = {
            ...room,
            customWalls: [...room.customWalls, newWall],
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Update custom wall
  const updateCustomWall = useCallback(
    (roomId: string, wallId: string, updates: Partial<WallSegment>) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedWalls = room.customWalls.map((wall) => {
            if (wall.id !== wallId) return wall;
            return { ...wall, ...updates };
          });
          const updatedRoom = {
            ...room,
            customWalls: updatedWalls,
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Remove custom wall
  const removeCustomWall = useCallback(
    (roomId: string, wallId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            customWalls: room.customWalls.filter((w) => w.id !== wallId),
          };
          return recalculateRoom(updatedRoom);
        })
      );
      setIsDirty(true);
    },
    [recalculateRoom]
  );

  // Save rooms to database
  const saveRoomsMutation = useMutation({
    mutationFn: async () => {
      // Delete existing rooms for this project
      await supabase.from("project_rooms").delete().eq("project_id", projectId);

      // Insert new rooms
      if (rooms.length > 0) {
        const inserts = rooms.map(toDbInsert);
        const { error } = await supabase.from("project_rooms").insert(inserts);
        if (error) throw error;
      }

      return rooms;
    },
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["project-rooms", projectId] });
    },
  });

  // Load rooms from database
  const loadRooms = useCallback(async () => {
    const { data, error } = await supabase
      .from("project_rooms")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    const loadedRooms = (data ?? []).map(toProjectRoom);
    setRooms(loadedRooms);
    setIsDirty(false);
    return loadedRooms;
  }, [projectId]);

  // Reset to empty
  const reset = useCallback(() => {
    setRooms([]);
    setIsDirty(false);
  }, []);

  // Calculate room-based sqft
  const roomsWallSqft = useMemo(
    () => rooms.reduce((sum, room) => sum + room.wallSqft, 0),
    [rooms]
  );

  const roomsCeilingSqft = useMemo(
    () => rooms.reduce((sum, room) => sum + room.ceilingSqft, 0),
    [rooms]
  );

  // Effective sqft based on input mode
  const totalWallSqft = inputMode === "rooms" ? roomsWallSqft : manualWallSqft;
  const totalCeilingSqft =
    inputMode === "rooms" ? roomsCeilingSqft : manualCeilingSqft;
  const totalSqft = totalWallSqft + totalCeilingSqft;

  return {
    // Data
    rooms,
    totalSqft,
    totalWallSqft,
    totalCeilingSqft,
    isDirty,
    // Input mode
    inputMode,
    setInputMode,
    // Manual sqft
    manualWallSqft,
    manualCeilingSqft,
    setManualWallSqft,
    setManualCeilingSqft,
    // Room CRUD
    addRoom,
    updateRoom,
    removeRoom,
    reorderRooms,
    // Opening management
    addOpening,
    addCustomOpening,
    updateOpening,
    removeOpening,
    // Custom wall management
    addCustomWall,
    updateCustomWall,
    removeCustomWall,
    // Persistence
    saveRooms: saveRoomsMutation.mutateAsync,
    isSaving: saveRoomsMutation.isPending,
    loadRooms,
    reset,
    // Set rooms directly (for loading)
    setRooms,
  };
}
