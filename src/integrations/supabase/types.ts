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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          company_id: string
          created_at: string | null
          email: string | null
          first_purchase_date: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email?: string | null
          first_purchase_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string | null
          first_purchase_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          fiscal_period: string
          id: string
          name: string
          owner_id: string
          tax_id: string | null
          tax_regime: Database["public"]["Enums"]["tax_regime"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          fiscal_period?: string
          id?: string
          name: string
          owner_id: string
          tax_id?: string | null
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          fiscal_period?: string
          id?: string
          name?: string
          owner_id?: string
          tax_id?: string | null
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          updated_at?: string
        }
        Relationships: []
      }
      dre_categories: {
        Row: {
          category_type: Database["public"]["Enums"]["category_type"]
          company_id: string
          cost_classification:
            | Database["public"]["Enums"]["cost_classification"]
            | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          category_type: Database["public"]["Enums"]["category_type"]
          company_id: string
          cost_classification?:
            | Database["public"]["Enums"]["cost_classification"]
            | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          category_type?: Database["public"]["Enums"]["category_type"]
          company_id?: string
          cost_classification?:
            | Database["public"]["Enums"]["cost_classification"]
            | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dre_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dre_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "dre_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          company_id: string
          created_at: string
          id: string
          metric_name: string
          period_month: number
          period_year: number
          target_value: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          metric_name: string
          period_month: number
          period_year: number
          target_value?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          metric_name?: string
          period_month?: number
          period_year?: number
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      metrics_cache: {
        Row: {
          average_ticket: number | null
          break_even_point: number | null
          cac: number | null
          company_id: string
          contribution_margin: number | null
          created_at: string | null
          fixed_costs: number | null
          id: string
          last_calculated_at: string | null
          ltv: number | null
          ltv_cac_ratio: number | null
          marketing_costs: number | null
          net_revenue: number | null
          new_clients_count: number | null
          operational_costs: number | null
          period_month: number
          period_year: number
          repeat_customers_count: number | null
          roi: number | null
          safety_margin: number | null
          sales_costs: number | null
          total_active_clients: number | null
          total_revenue: number | null
          total_sales_count: number | null
          variable_costs: number | null
        }
        Insert: {
          average_ticket?: number | null
          break_even_point?: number | null
          cac?: number | null
          company_id: string
          contribution_margin?: number | null
          created_at?: string | null
          fixed_costs?: number | null
          id?: string
          last_calculated_at?: string | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          marketing_costs?: number | null
          net_revenue?: number | null
          new_clients_count?: number | null
          operational_costs?: number | null
          period_month: number
          period_year: number
          repeat_customers_count?: number | null
          roi?: number | null
          safety_margin?: number | null
          sales_costs?: number | null
          total_active_clients?: number | null
          total_revenue?: number | null
          total_sales_count?: number | null
          variable_costs?: number | null
        }
        Update: {
          average_ticket?: number | null
          break_even_point?: number | null
          cac?: number | null
          company_id?: string
          contribution_margin?: number | null
          created_at?: string | null
          fixed_costs?: number | null
          id?: string
          last_calculated_at?: string | null
          ltv?: number | null
          ltv_cac_ratio?: number | null
          marketing_costs?: number | null
          net_revenue?: number | null
          new_clients_count?: number | null
          operational_costs?: number | null
          period_month?: number
          period_year?: number
          repeat_customers_count?: number | null
          roi?: number | null
          safety_margin?: number | null
          sales_costs?: number | null
          total_active_clients?: number | null
          total_revenue?: number | null
          total_sales_count?: number | null
          variable_costs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_cache_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          cofins_rate: number | null
          company_id: string
          created_at: string | null
          csll_rate: number | null
          das_rate: number | null
          icms_rate: number | null
          id: string
          ipi_rate: number | null
          irpj_additional_rate: number | null
          irpj_additional_threshold: number | null
          irpj_rate: number | null
          iss_rate: number | null
          last_updated: string | null
          pis_rate: number | null
          regime_type: string | null
          use_das: boolean | null
        }
        Insert: {
          cofins_rate?: number | null
          company_id: string
          created_at?: string | null
          csll_rate?: number | null
          das_rate?: number | null
          icms_rate?: number | null
          id?: string
          ipi_rate?: number | null
          irpj_additional_rate?: number | null
          irpj_additional_threshold?: number | null
          irpj_rate?: number | null
          iss_rate?: number | null
          last_updated?: string | null
          pis_rate?: number | null
          regime_type?: string | null
          use_das?: boolean | null
        }
        Update: {
          cofins_rate?: number | null
          company_id?: string
          created_at?: string | null
          csll_rate?: number | null
          das_rate?: number | null
          icms_rate?: number | null
          id?: string
          ipi_rate?: number | null
          irpj_additional_rate?: number | null
          irpj_additional_threshold?: number | null
          irpj_rate?: number | null
          iss_rate?: number | null
          last_updated?: string | null
          pis_rate?: number | null
          regime_type?: string | null
          use_das?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_configurations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          client_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_marketing_cost: boolean | null
          is_new_client: boolean | null
          is_sales_cost: boolean | null
          month: number
          tax_breakdown: Json | null
          transaction_date: string
          transaction_type: string | null
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          category_id?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_marketing_cost?: boolean | null
          is_new_client?: boolean | null
          is_sales_cost?: boolean | null
          month: number
          tax_breakdown?: Json | null
          transaction_date: string
          transaction_type?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          category_id?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_marketing_cost?: boolean | null
          is_new_client?: boolean | null
          is_sales_cost?: boolean | null
          month?: number
          tax_breakdown?: Json | null
          transaction_date?: string
          transaction_type?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "dre_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_and_cache_metrics: {
        Args: { p_company_id: string; p_month: number; p_year: number }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      category_type: "revenue" | "cost" | "expense"
      cost_classification: "fixed" | "variable"
      tax_regime: "simples_nacional" | "lucro_presumido" | "lucro_real"
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
    Enums: {
      app_role: ["admin", "manager", "user"],
      category_type: ["revenue", "cost", "expense"],
      cost_classification: ["fixed", "variable"],
      tax_regime: ["simples_nacional", "lucro_presumido", "lucro_real"],
    },
  },
} as const
