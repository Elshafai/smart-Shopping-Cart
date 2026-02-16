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
      appuser: {
        Row: {
          email: string
          fname: string
          lname: string
          name: string | null
          password: string
          userid: number
          username: string
          uuid: string
        }
        Insert: {
          email: string
          fname: string
          lname: string
          name?: string | null
          password: string
          userid?: number
          username: string
          uuid?: string
        }
        Update: {
          email?: string
          fname?: string
          lname?: string
          name?: string | null
          password?: string
          userid?: number
          username?: string
          uuid?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          cartid: number
          status: boolean
          userid: number | null
        }
        Insert: {
          cartid?: number
          status?: boolean
          userid?: number | null
        }
        Update: {
          cartid?: number
          status?: boolean
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "appuser"
            referencedColumns: ["userid"]
          },
        ]
      }
      cartproduct: {
        Row: {
          cartid: number | null
          cartproductid: number
          productid: number | null
          quantity: number | null
        }
        Insert: {
          cartid?: number | null
          cartproductid?: number
          productid?: number | null
          quantity?: number | null
        }
        Update: {
          cartid?: number | null
          cartproductid?: number
          productid?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cartproduct_cartid_fkey"
            columns: ["cartid"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["cartid"]
          },
          {
            foreignKeyName: "cartproduct_productid_fkey"
            columns: ["productid"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["productid"]
          },
        ]
      }
      category: {
        Row: {
          categoryid: number
          categoryname: string
        }
        Insert: {
          categoryid?: number
          categoryname: string
        }
        Update: {
          categoryid?: number
          categoryname?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          categoryid: number | null
          imagepath: string | null
          name: string
          price: number
          productid: number
          stock: number
        }
        Insert: {
          categoryid?: number | null
          imagepath?: string | null
          name: string
          price: number
          productid?: number
          stock: number
        }
        Update: {
          categoryid?: number | null
          imagepath?: string | null
          name?: string
          price?: number
          productid?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["categoryid"]
          },
        ]
      }
      qr_codes: {
        Row: {
          cartid: number
          qr_code: string
          qr_id: number
        }
        Insert: {
          cartid: number
          qr_code: string
          qr_id?: number
        }
        Update: {
          cartid?: number
          qr_code?: string
          qr_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_cartid_fkey"
            columns: ["cartid"]
            isOneToOne: true
            referencedRelation: "cart"
            referencedColumns: ["cartid"]
          },
        ]
      }
      qr_sessions: {
        Row: {
          cartid: number
          expires_at: string
          id: string
          is_used: boolean | null
          qr_id: number
          userid: number | null
        }
        Insert: {
          cartid: number
          expires_at: string
          id?: string
          is_used?: boolean | null
          qr_id: number
          userid?: number | null
        }
        Update: {
          cartid?: number
          expires_at?: string
          id?: string
          is_used?: boolean | null
          qr_id?: number
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_sessions_cartid_fkey"
            columns: ["cartid"]
            isOneToOne: false
            referencedRelation: "cart"
            referencedColumns: ["cartid"]
          },
          {
            foreignKeyName: "qr_sessions_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["qr_id"]
          },
          {
            foreignKeyName: "qr_sessions_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "appuser"
            referencedColumns: ["userid"]
          },
        ]
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
