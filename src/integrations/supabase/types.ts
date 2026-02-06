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
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          listing_id: string
          photo_type: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          listing_id: string
          photo_type: string
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          listing_id?: string
          photo_type?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asking_price: number
          brand_id: string
          condition: Database["public"]["Enums"]["watch_condition"]
          created_at: string
          currency: string
          description: string | null
          has_box: boolean
          has_papers: boolean
          id: string
          model: string
          reference_number: string
          rejection_reason: string | null
          seller_id: string
          serial_number: string | null
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
          views_count: number | null
          year_produced: number | null
          year_produced_end: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asking_price: number
          brand_id: string
          condition: Database["public"]["Enums"]["watch_condition"]
          created_at?: string
          currency?: string
          description?: string | null
          has_box?: boolean
          has_papers?: boolean
          id?: string
          model: string
          reference_number: string
          rejection_reason?: string | null
          seller_id: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          views_count?: number | null
          year_produced?: number | null
          year_produced_end?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asking_price?: number
          brand_id?: string
          condition?: Database["public"]["Enums"]["watch_condition"]
          created_at?: string
          currency?: string
          description?: string | null
          has_box?: boolean
          has_papers?: boolean
          id?: string
          model?: string
          reference_number?: string
          rejection_reason?: string | null
          seller_id?: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          views_count?: number | null
          year_produced?: number | null
          year_produced_end?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["post_category"]
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: Database["public"]["Enums"]["post_category"]
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["post_category"]
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_context: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          last_updated_by: string | null
          notes: string | null
          price_expected: number | null
          price_low: number | null
          price_premium: number | null
          reference_number: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          last_updated_by?: string | null
          notes?: string | null
          price_expected?: number | null
          price_low?: number | null
          price_premium?: number | null
          reference_number: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          last_updated_by?: string | null
          notes?: string | null
          price_expected?: number | null
          price_low?: number | null
          price_premium?: number | null
          reference_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_context_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          kyc_status: Database["public"]["Enums"]["verification_status"]
          kyc_verified_at: string | null
          phone: string | null
          stripe_connect_account_id: string | null
          stripe_customer_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
          zero_fee_eligible: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["verification_status"]
          kyc_verified_at?: string | null
          phone?: string | null
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
          zero_fee_eligible?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          kyc_status?: Database["public"]["Enums"]["verification_status"]
          kyc_verified_at?: string | null
          phone?: string | null
          stripe_connect_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
          zero_fee_eligible?: boolean | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string
          commission_amount: number | null
          completed_at: string | null
          created_at: string
          currency: string
          delivered_at: string | null
          id: string
          listing_id: string
          seller_id: string
          shipped_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          id?: string
          listing_id: string
          seller_id: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          id?: string
          listing_id?: string
          seller_id?: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
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
          role: Database["public"]["Enums"]["app_role"]
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
      can_sell: { Args: { _user_id: string }; Returns: boolean }
      count_active_listings: { Args: { _user_id: string }; Returns: number }
      get_commission_rate: { Args: { _user_id: string }; Returns: number }
      get_listing_limit: { Args: { _user_id: string }; Returns: number }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "observer"
        | "individual_seller"
        | "super_seller"
        | "buyer"
      listing_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "sold"
        | "archived"
      post_category: "market_insights" | "reference_guides" | "authentication"
      transaction_status:
        | "pending_payment"
        | "payment_held"
        | "shipped"
        | "delivered"
        | "completed"
        | "disputed"
        | "refunded"
        | "cancelled"
      verification_status: "not_started" | "pending" | "verified" | "rejected"
      watch_condition: "unworn" | "excellent" | "very_good" | "good" | "fair"
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
      app_role: [
        "admin",
        "observer",
        "individual_seller",
        "super_seller",
        "buyer",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "sold",
        "archived",
      ],
      post_category: ["market_insights", "reference_guides", "authentication"],
      transaction_status: [
        "pending_payment",
        "payment_held",
        "shipped",
        "delivered",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
      verification_status: ["not_started", "pending", "verified", "rejected"],
      watch_condition: ["unworn", "excellent", "very_good", "good", "fair"],
    },
  },
} as const
