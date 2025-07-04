export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      break_intervals: {
        Row: {
          created_at: string
          end_time: string
          id: string
          shift_id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          shift_id: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          shift_id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_recipients: {
        Row: {
          account_number: string | null
          address: string | null
          address1: string | null
          address2: string | null
          bank_account_name: string | null
          bic_swift: string | null
          city: string | null
          company_name: string
          contact_name: string
          country: string | null
          county: string | null
          created_at: string
          credit_terms: number | null
          email: string
          iban: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          phone_number: string | null
          postcode: string | null
          sort_code: string | null
          terms_conditions: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          address1?: string | null
          address2?: string | null
          bank_account_name?: string | null
          bic_swift?: string | null
          city?: string | null
          company_name: string
          contact_name: string
          country?: string | null
          county?: string | null
          created_at?: string
          credit_terms?: number | null
          email: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postcode?: string | null
          sort_code?: string | null
          terms_conditions?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          address1?: string | null
          address2?: string | null
          bank_account_name?: string | null
          bic_swift?: string | null
          city?: string | null
          company_name?: string
          contact_name?: string
          country?: string | null
          county?: string | null
          created_at?: string
          credit_terms?: number | null
          email?: string
          iban?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone_number?: string | null
          postcode?: string | null
          sort_code?: string | null
          terms_conditions?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      invoice_settings: {
        Row: {
          address1: string
          address2: string | null
          business_name: string
          city: string
          country: string
          county: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          postcode: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address1: string
          address2?: string | null
          business_name: string
          city: string
          country: string
          county?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          postcode: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address1?: string
          address2?: string | null
          business_name?: string
          city?: string
          country?: string
          county?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          postcode?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          county: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          postcode: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          postcode?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          postcode?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          break_duration: number
          created_at: string
          employer_name: string
          end_time: string
          id: string
          manager_end_name: string
          manager_end_signature: string | null
          manager_start_name: string
          manager_start_signature: string | null
          pay_rate: number
          rate_type: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          break_duration: number
          created_at?: string
          employer_name: string
          end_time: string
          id?: string
          manager_end_name: string
          manager_end_signature?: string | null
          manager_start_name: string
          manager_start_signature?: string | null
          pay_rate: number
          rate_type: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          break_duration?: number
          created_at?: string
          employer_name?: string
          end_time?: string
          id?: string
          manager_end_name?: string
          manager_end_signature?: string | null
          manager_start_name?: string
          manager_start_signature?: string | null
          pay_rate?: number
          rate_type?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
