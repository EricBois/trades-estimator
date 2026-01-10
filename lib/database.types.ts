export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          contractor_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          street: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          contractor_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          contractor_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      estimate_photos: {
        Row: {
          created_at: string | null;
          estimate_id: string | null;
          id: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string | null;
          estimate_id?: string | null;
          id?: string;
          storage_path: string;
        };
        Update: {
          created_at?: string | null;
          estimate_id?: string | null;
          id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "estimate_photos_estimate_id_fkey";
            columns: ["estimate_id"];
            isOneToOne: false;
            referencedRelation: "estimates";
            referencedColumns: ["id"];
          }
        ];
      };
      estimate_templates: {
        Row: {
          base_labor_hours: number;
          base_material_cost: number;
          complexity_multipliers: Json | null;
          contractor_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          pricing_model: string | null;
          required_fields: Json | null;
          template_name: string;
          trade_type: string;
          unit_price: number | null;
        };
        Insert: {
          base_labor_hours: number;
          base_material_cost: number;
          complexity_multipliers?: Json | null;
          contractor_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          pricing_model?: string | null;
          required_fields?: Json | null;
          template_name: string;
          trade_type: string;
          unit_price?: number | null;
        };
        Update: {
          base_labor_hours?: number;
          base_material_cost?: number;
          complexity_multipliers?: Json | null;
          contractor_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          pricing_model?: string | null;
          required_fields?: Json | null;
          template_name?: string;
          trade_type?: string;
          unit_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "estimate_templates_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      estimates: {
        Row: {
          client_id: string | null;
          contractor_id: string;
          created_at: string | null;
          expires_at: string | null;
          homeowner_email: string;
          homeowner_name: string;
          homeowner_phone: string | null;
          id: string;
          name: string | null;
          parameters: Json | null;
          project_description: string | null;
          project_id: string | null;
          range_high: number;
          range_low: number;
          requested_detailed_at: string | null;
          status: string | null;
          template_id: string | null;
          template_type: string;
          updated_at: string | null;
          viewed_at: string | null;
        };
        Insert: {
          client_id?: string | null;
          contractor_id?: string;
          created_at?: string | null;
          expires_at?: string | null;
          homeowner_email: string;
          homeowner_name: string;
          homeowner_phone?: string | null;
          id?: string;
          name?: string | null;
          parameters?: Json | null;
          project_description?: string | null;
          project_id?: string | null;
          range_high: number;
          range_low: number;
          requested_detailed_at?: string | null;
          status?: string | null;
          template_id?: string | null;
          template_type: string;
          updated_at?: string | null;
          viewed_at?: string | null;
        };
        Update: {
          client_id?: string | null;
          contractor_id?: string;
          created_at?: string | null;
          expires_at?: string | null;
          homeowner_email?: string;
          homeowner_name?: string;
          homeowner_phone?: string | null;
          id?: string;
          name?: string | null;
          parameters?: Json | null;
          project_description?: string | null;
          project_id?: string | null;
          range_high?: number;
          range_low?: number;
          requested_detailed_at?: string | null;
          status?: string | null;
          template_id?: string | null;
          template_type?: string;
          updated_at?: string | null;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "estimates_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estimates_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estimates_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "estimates_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "estimate_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          company_name: string;
          created_at: string | null;
          custom_rates: Json | null;
          hidden_template_ids: string[] | null;
          hourly_rate: number | null;
          id: string;
          logo_url: string | null;
          preferred_trade_types: string[] | null;
          service_areas: string[] | null;
          templates_onboarded: boolean | null;
          trade_type: string;
          updated_at: string | null;
        };
        Insert: {
          company_name: string;
          created_at?: string | null;
          custom_rates?: Json | null;
          hidden_template_ids?: string[] | null;
          hourly_rate?: number | null;
          id: string;
          logo_url?: string | null;
          preferred_trade_types?: string[] | null;
          service_areas?: string[] | null;
          templates_onboarded?: boolean | null;
          trade_type: string;
          updated_at?: string | null;
        };
        Update: {
          company_name?: string;
          created_at?: string | null;
          custom_rates?: Json | null;
          hidden_template_ids?: string[] | null;
          hourly_rate?: number | null;
          id?: string;
          logo_url?: string | null;
          preferred_trade_types?: string[] | null;
          service_areas?: string[] | null;
          templates_onboarded?: boolean | null;
          trade_type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contractor_materials: {
        Row: {
          id: string;
          contractor_id: string | null; // NULL = preset/global material
          preset_id: string | null; // If set, this is an override of a preset
          name: string;
          category: string;
          unit: string;
          unit_size: string | null;
          base_price: number;
          description: string | null;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          contractor_id?: string | null; // NULL = preset/global material
          preset_id?: string | null;
          name: string;
          category: string;
          unit: string;
          unit_size?: string | null;
          base_price: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          contractor_id?: string | null;
          preset_id?: string | null;
          name?: string;
          category?: string;
          unit?: string;
          unit_size?: string | null;
          base_price?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contractor_materials_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      project_room_overrides: {
        Row: {
          created_at: string | null;
          excluded: boolean | null;
          id: string;
          include_ceiling: boolean | null;
          include_walls: boolean | null;
          project_room_id: string;
          trade_type: string;
        };
        Insert: {
          created_at?: string | null;
          excluded?: boolean | null;
          id?: string;
          include_ceiling?: boolean | null;
          include_walls?: boolean | null;
          project_room_id: string;
          trade_type: string;
        };
        Update: {
          created_at?: string | null;
          excluded?: boolean | null;
          id?: string;
          include_ceiling?: boolean | null;
          include_walls?: boolean | null;
          project_room_id?: string;
          trade_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_room_overrides_project_room_id_fkey";
            columns: ["project_room_id"];
            isOneToOne: false;
            referencedRelation: "project_rooms";
            referencedColumns: ["id"];
          }
        ];
      };
      project_rooms: {
        Row: {
          ceiling_sqft: number | null;
          created_at: string | null;
          custom_ceiling_sqft: number | null;
          custom_walls: Json | null;
          doors: Json | null;
          height_feet: number | null;
          height_inches: number | null;
          id: string;
          l_shape_dimensions: Json | null;
          length_feet: number | null;
          length_inches: number | null;
          name: string;
          openings_sqft: number | null;
          project_id: string;
          shape: string | null;
          sort_order: number | null;
          total_sqft: number | null;
          wall_sqft: number | null;
          width_feet: number | null;
          width_inches: number | null;
          windows: Json | null;
        };
        Insert: {
          ceiling_sqft?: number | null;
          created_at?: string | null;
          custom_ceiling_sqft?: number | null;
          custom_walls?: Json | null;
          doors?: Json | null;
          height_feet?: number | null;
          height_inches?: number | null;
          id?: string;
          l_shape_dimensions?: Json | null;
          length_feet?: number | null;
          length_inches?: number | null;
          name: string;
          openings_sqft?: number | null;
          project_id: string;
          shape?: string | null;
          sort_order?: number | null;
          total_sqft?: number | null;
          wall_sqft?: number | null;
          width_feet?: number | null;
          width_inches?: number | null;
          windows?: Json | null;
        };
        Update: {
          ceiling_sqft?: number | null;
          created_at?: string | null;
          custom_ceiling_sqft?: number | null;
          custom_walls?: Json | null;
          doors?: Json | null;
          height_feet?: number | null;
          height_inches?: number | null;
          id?: string;
          l_shape_dimensions?: Json | null;
          length_feet?: number | null;
          length_inches?: number | null;
          name?: string;
          openings_sqft?: number | null;
          project_id?: string;
          shape?: string | null;
          sort_order?: number | null;
          total_sqft?: number | null;
          wall_sqft?: number | null;
          width_feet?: number | null;
          width_inches?: number | null;
          windows?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "project_rooms_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      project_trades: {
        Row: {
          created_at: string | null;
          enabled: boolean | null;
          id: string;
          parameters: Json | null;
          project_id: string;
          range_high: number | null;
          range_low: number | null;
          sort_order: number | null;
          trade_type: string;
        };
        Insert: {
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          parameters?: Json | null;
          project_id: string;
          range_high?: number | null;
          range_low?: number | null;
          sort_order?: number | null;
          trade_type: string;
        };
        Update: {
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          parameters?: Json | null;
          project_id?: string;
          range_high?: number | null;
          range_low?: number | null;
          sort_order?: number | null;
          trade_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_trades_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          client_id: string | null;
          contractor_id: string;
          created_at: string | null;
          expires_at: string | null;
          homeowner_email: string;
          homeowner_name: string;
          homeowner_phone: string | null;
          id: string;
          name: string;
          project_description: string | null;
          range_high: number | null;
          range_low: number | null;
          status: string | null;
          updated_at: string | null;
          viewed_at: string | null;
        };
        Insert: {
          client_id?: string | null;
          contractor_id: string;
          created_at?: string | null;
          expires_at?: string | null;
          homeowner_email: string;
          homeowner_name: string;
          homeowner_phone?: string | null;
          id?: string;
          name: string;
          project_description?: string | null;
          range_high?: number | null;
          range_low?: number | null;
          status?: string | null;
          updated_at?: string | null;
          viewed_at?: string | null;
        };
        Update: {
          client_id?: string | null;
          contractor_id?: string;
          created_at?: string | null;
          expires_at?: string | null;
          homeowner_email?: string;
          homeowner_name?: string;
          homeowner_phone?: string | null;
          id?: string;
          name?: string;
          project_description?: string | null;
          range_high?: number | null;
          range_low?: number | null;
          status?: string | null;
          updated_at?: string | null;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
