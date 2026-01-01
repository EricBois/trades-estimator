"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Material categories matching the database constraint
export const MATERIAL_CATEGORIES = [
  "mud",
  "tape",
  "corner_bead",
  "primer",
  "other",
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

export interface ContractorMaterial {
  id: string;
  contractorId: string | null; // NULL = preset/global material
  presetId: string | null; // If set, this is an override of a preset
  name: string;
  category: MaterialCategory;
  unit: string;
  unitSize: string | null;
  basePrice: number;
  description: string | null;
  isActive: boolean;
  isPreset: boolean; // true if contractor_id is NULL
  isPresetOverride: boolean; // true if preset_id is set
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateMaterialInput {
  name: string;
  category: MaterialCategory;
  unit: string;
  unitSize?: string | null;
  basePrice: number;
  description?: string | null;
}

export interface UpdateMaterialInput {
  id: string;
  name?: string;
  category?: MaterialCategory;
  unit?: string;
  unitSize?: string | null;
  basePrice?: number;
  description?: string | null;
  isActive?: boolean;
}

// Helper to map database row to ContractorMaterial
function mapMaterial(m: {
  id: string;
  contractor_id: string | null;
  preset_id?: string | null;
  name: string;
  category: string;
  unit: string;
  unit_size: string | null;
  base_price: number;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}): ContractorMaterial {
  return {
    id: m.id,
    contractorId: m.contractor_id,
    presetId: m.preset_id ?? null,
    name: m.name,
    category: m.category as MaterialCategory,
    unit: m.unit,
    unitSize: m.unit_size,
    basePrice: m.base_price,
    description: m.description,
    isActive: m.is_active,
    isPreset: m.contractor_id === null,
    isPresetOverride: m.preset_id !== null && m.preset_id !== undefined,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

// Fetch contractor's custom materials only (not presets)
export function useContractorMaterials(activeOnly = true) {
  return useQuery({
    queryKey: ["contractor_materials", "custom", activeOnly],
    queryFn: async (): Promise<ContractorMaterial[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("contractor_materials")
        .select("*")
        .eq("contractor_id", user.id)
        .order("category")
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("contractor_materials query error:", error.message);
        return [];
      }

      return (data ?? []).map(mapMaterial);
    },
    retry: false,
  });
}

// Fetch all materials (presets + contractor's custom materials)
export function useAllMaterials(activeOnly = true) {
  return useQuery({
    queryKey: ["contractor_materials", "all", activeOnly],
    queryFn: async (): Promise<ContractorMaterial[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch both presets (contractor_id IS NULL) and contractor's materials
      let query = supabase
        .from("contractor_materials")
        .select("*")
        .or(`contractor_id.is.null,contractor_id.eq.${user.id}`)
        .order("category")
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("contractor_materials query error:", error.message);
        return [];
      }

      return (data ?? []).map(mapMaterial);
    },
    retry: false,
  });
}

// Fetch preset materials only (contractor_id IS NULL)
export function usePresetMaterials(activeOnly = true) {
  return useQuery({
    queryKey: ["contractor_materials", "presets", activeOnly],
    queryFn: async (): Promise<ContractorMaterial[]> => {
      let query = supabase
        .from("contractor_materials")
        .select("*")
        .is("contractor_id", null)
        .order("category")
        .order("name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("contractor_materials query error:", error.message);
        return [];
      }

      return (data ?? []).map(mapMaterial);
    },
    retry: false,
  });
}

// Fetch presets with contractor's overrides applied
// Returns presets, but if contractor has an override, returns the override instead
export function usePresetsWithOverrides(activeOnly = true) {
  return useQuery({
    queryKey: ["contractor_materials", "presets_with_overrides", activeOnly],
    queryFn: async (): Promise<{
      presets: ContractorMaterial[];
      overrides: Map<string, ContractorMaterial>;
    }> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch all presets
      let presetsQuery = supabase
        .from("contractor_materials")
        .select("*")
        .is("contractor_id", null)
        .order("category")
        .order("name");

      if (activeOnly) {
        presetsQuery = presetsQuery.eq("is_active", true);
      }

      const { data: presetsData, error: presetsError } = await presetsQuery;

      if (presetsError) {
        console.warn("presets query error:", presetsError.message);
        return { presets: [], overrides: new Map() };
      }

      const presets = (presetsData ?? []).map(mapMaterial);

      // If no user, just return presets without overrides
      if (!user) {
        return { presets, overrides: new Map() };
      }

      // Fetch contractor's overrides
      const { data: overridesData, error: overridesError } = await supabase
        .from("contractor_materials")
        .select("*")
        .eq("contractor_id", user.id)
        .not("preset_id", "is", null);

      if (overridesError) {
        console.warn("overrides query error:", overridesError.message);
        return { presets, overrides: new Map() };
      }

      // Build map of preset_id -> override
      const overrides = new Map<string, ContractorMaterial>();
      for (const override of overridesData ?? []) {
        if (override.preset_id) {
          overrides.set(override.preset_id, mapMaterial(override));
        }
      }

      return { presets, overrides };
    },
    retry: false,
  });
}

// Fetch all materials by category (presets + contractor's)
export function useContractorMaterialsByCategory(category: MaterialCategory) {
  return useQuery({
    queryKey: ["contractor_materials", "category", category],
    queryFn: async (): Promise<ContractorMaterial[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch both presets and contractor's materials for this category
      const { data, error } = await supabase
        .from("contractor_materials")
        .select("*")
        .or(`contractor_id.is.null,contractor_id.eq.${user.id}`)
        .eq("category", category)
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.warn("contractor_materials query error:", error.message);
        return [];
      }

      return (data ?? []).map(mapMaterial);
    },
    retry: false,
  });
}

// Create a new material
export function useCreateContractorMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateMaterialInput
    ): Promise<ContractorMaterial> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("contractor_materials")
        .insert({
          contractor_id: user.id,
          name: input.name,
          category: input.category,
          unit: input.unit,
          unit_size: input.unitSize ?? null,
          base_price: input.basePrice,
          description: input.description ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return mapMaterial(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}

// Update an existing material (only works for contractor's own materials, not presets)
export function useUpdateContractorMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: UpdateMaterialInput
    ): Promise<ContractorMaterial> => {
      const dbUpdates: Record<string, unknown> = {};

      if (input.name !== undefined) dbUpdates.name = input.name;
      if (input.category !== undefined) dbUpdates.category = input.category;
      if (input.unit !== undefined) dbUpdates.unit = input.unit;
      if (input.unitSize !== undefined) dbUpdates.unit_size = input.unitSize;
      if (input.basePrice !== undefined) dbUpdates.base_price = input.basePrice;
      if (input.description !== undefined)
        dbUpdates.description = input.description;
      if (input.isActive !== undefined) dbUpdates.is_active = input.isActive;

      const { data, error } = await supabase
        .from("contractor_materials")
        .update(dbUpdates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;

      return mapMaterial(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}

// Delete a material (or deactivate it)
export function useDeleteContractorMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("contractor_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}

// Toggle material active status (soft delete)
export function useToggleMaterialActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }): Promise<void> => {
      const { error } = await supabase
        .from("contractor_materials")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}

// Create or update a preset override (contractor's custom price for a preset material)
export function useSetPresetOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      presetId,
      price,
    }: {
      presetId: string;
      price: number;
    }): Promise<ContractorMaterial> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, get the preset material to copy its data
      const { data: preset, error: presetError } = await supabase
        .from("contractor_materials")
        .select("*")
        .eq("id", presetId)
        .is("contractor_id", null)
        .single();

      if (presetError || !preset) {
        throw new Error("Preset material not found");
      }

      // Check if an override already exists
      const { data: existingOverride } = await supabase
        .from("contractor_materials")
        .select("*")
        .eq("contractor_id", user.id)
        .eq("preset_id", presetId)
        .single();

      if (existingOverride) {
        // Update existing override
        const { data, error } = await supabase
          .from("contractor_materials")
          .update({ base_price: price })
          .eq("id", existingOverride.id)
          .select()
          .single();

        if (error) throw error;
        return mapMaterial(data);
      } else {
        // Create new override
        const { data, error } = await supabase
          .from("contractor_materials")
          .insert({
            contractor_id: user.id,
            preset_id: presetId,
            name: preset.name,
            category: preset.category,
            unit: preset.unit,
            unit_size: preset.unit_size,
            base_price: price,
            description: preset.description,
          })
          .select()
          .single();

        if (error) throw error;
        return mapMaterial(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}

// Remove a preset override (revert to default price)
export function useRemovePresetOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find and delete the override
      const { error } = await supabase
        .from("contractor_materials")
        .delete()
        .eq("contractor_id", user.id)
        .eq("preset_id", presetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractor_materials"] });
    },
  });
}
