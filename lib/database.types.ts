export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      estimate_photos: {
        Row: {
          created_at: string | null
          estimate_id: string | null
          id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          estimate_id?: string | null
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_photos_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_templates: {
        Row: {
          base_labor_hours: number
          base_material_cost: number
          complexity_multipliers: Json | null
          contractor_id: string | null
          created_at: string | null
          description: string | null
          id: string
          required_fields: Json | null
          template_name: string
          trade_type: string
        }
        Insert: {
          base_labor_hours: number
          base_material_cost: number
          complexity_multipliers?: Json | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          required_fields?: Json | null
          template_name: string
          trade_type: string
        }
        Update: {
          base_labor_hours?: number
          base_material_cost?: number
          complexity_multipliers?: Json | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          required_fields?: Json | null
          template_name?: string
          trade_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_templates_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          contractor_id: string
          created_at: string | null
          expires_at: string | null
          homeowner_email: string
          homeowner_name: string
          homeowner_phone: string | null
          id: string
          parameters: Json | null
          project_description: string | null
          range_high: number
          range_low: number
          requested_detailed_at: string | null
          status: string | null
          template_id: string | null
          template_type: string
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          expires_at?: string | null
          homeowner_email: string
          homeowner_name: string
          homeowner_phone?: string | null
          id?: string
          parameters?: Json | null
          project_description?: string | null
          range_high: number
          range_low: number
          requested_detailed_at?: string | null
          status?: string | null
          template_id?: string | null
          template_type: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          expires_at?: string | null
          homeowner_email?: string
          homeowner_name?: string
          homeowner_phone?: string | null
          id?: string
          parameters?: Json | null
          project_description?: string | null
          range_high?: number
          range_low?: number
          requested_detailed_at?: string | null
          status?: string | null
          template_id?: string | null
          template_type?: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "estimate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string
          created_at: string | null
          custom_rates: Json | null
          hidden_template_ids: string[] | null
          hourly_rate: number | null
          id: string
          service_areas: string[] | null
          templates_onboarded: boolean | null
          trade_type: string
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          custom_rates?: Json | null
          hidden_template_ids?: string[] | null
          hourly_rate?: number | null
          id: string
          service_areas?: string[] | null
          templates_onboarded?: boolean | null
          trade_type: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          custom_rates?: Json | null
          hidden_template_ids?: string[] | null
          hourly_rate?: number | null
          id?: string
          service_areas?: string[] | null
          templates_onboarded?: boolean | null
          trade_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
