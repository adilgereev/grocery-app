export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          apartment: string | null
          created_at: string
          entrance: string | null
          floor: string | null
          house: string | null
          id: string
          intercom: string | null
          is_selected: boolean | null
          lat: number | null
          lon: number | null
          text: string
          user_id: string
        }
        Insert: {
          apartment?: string | null
          created_at?: string
          entrance?: string | null
          floor?: string | null
          house?: string | null
          id?: string
          intercom?: string | null
          is_selected?: boolean | null
          lat?: number | null
          lon?: number | null
          text: string
          user_id: string
        }
        Update: {
          apartment?: string | null
          created_at?: string
          entrance?: string | null
          floor?: string | null
          house?: string | null
          id?: string
          intercom?: string | null
          is_selected?: boolean | null
          lat?: number | null
          lon?: number | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_transformations: string | null
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_transformations?: string | null
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_transformations?: string | null
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_with_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          changed_by_role: string
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          changed_by_role?: string
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          changed_by_role?: string
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          comment: string | null
          created_at: string
          delivery_address: string
          discount_amount: number | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          promo_code: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          delivery_address: string
          discount_amount?: number | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          promo_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          delivery_address?: string
          discount_amount?: number | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          promo_code?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          calories: number | null
          carbohydrates: number | null
          category_id: string | null
          created_at: string
          description: string | null
          fats: number | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          proteins: number | null
          stock: number
          tags: string[] | null
          unit: string
        }
        Insert: {
          calories?: number | null
          carbohydrates?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          fats?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          proteins?: number | null
          stock?: number
          tags?: string[] | null
          unit: string
        }
        Update: {
          calories?: number | null
          carbohydrates?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          fats?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          proteins?: number | null
          stock?: number
          tags?: string[] | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_courier: boolean | null
          is_picker: boolean | null
          phone: string
          push_token: string | null
          terms_accepted_at: string | null
          terms_version: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_courier?: boolean | null
          is_picker?: boolean | null
          phone: string
          push_token?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_courier?: boolean | null
          is_picker?: boolean | null
          phone?: string
          push_token?: string | null
          terms_accepted_at?: string | null
          terms_version?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          id: string
          order_id: string
          staff_id: string
          staff_type: string
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          id?: string
          order_id: string
          staff_id: string
          staff_type: string
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          id?: string
          order_id?: string
          staff_id?: string
          staff_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      categories_with_hierarchy: {
        Row: {
          created_at: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_root: boolean | null
          name: string | null
          parent_id: string | null
          parent_image_url: string | null
          parent_name: string | null
          parent_slug: string | null
          slug: string | null
          sort_order: number | null
          subcategory_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories_with_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      complete_courier_delivery: {
        Args: { p_order_id: string; p_staff_id: string }
        Returns: undefined
      }
      complete_picker_assembly: {
        Args: { p_order_id: string; p_staff_id: string }
        Returns: undefined
      }
      delete_order_item: {
        Args: {
          p_admin_id: string
          p_current_status: string
          p_item_id: string
          p_new_total: number
          p_order_id: string
          p_product_name: string
        }
        Returns: undefined
      }
      increment_promo_used_count: {
        Args: { promo_code_text: string }
        Returns: undefined
      }
      replace_order_item: {
        Args: {
          p_admin_id: string
          p_current_status: string
          p_item_id: string
          p_new_price: number
          p_new_product_id: string
          p_new_product_name: string
          p_new_total: number
          p_order_id: string
          p_original_product_name: string
        }
        Returns: undefined
      }
      select_delivery_address: {
        Args: { p_address_id: string; p_user_id: string }
        Returns: undefined
      }
      take_order_courier: {
        Args: { p_order_id: string; p_staff_id: string }
        Returns: undefined
      }
      take_order_picker: {
        Args: { p_order_id: string; p_staff_id: string }
        Returns: undefined
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "processing"
        | "assembled"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method: "cash" | "online"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: [
        "pending",
        "processing",
        "assembled",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cash", "online"],
    },
  },
} as const

