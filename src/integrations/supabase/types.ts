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
      fight_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          fight_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          fight_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          fight_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fight_activities_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: false
            referencedRelation: "fights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fight_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fights: {
        Row: {
          created_at: string | null
          creator_animal: string
          creator_id: string
          description: string
          id: string
          mediator_id: string | null
          opponent_accepted: boolean | null
          opponent_accepted_at: string | null
          opponent_animal: string | null
          opponent_email: string | null
          resolution: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_animal: string
          creator_id: string
          description: string
          id?: string
          mediator_id?: string | null
          opponent_accepted?: boolean | null
          opponent_accepted_at?: string | null
          opponent_animal?: string | null
          opponent_email?: string | null
          resolution?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_animal?: string
          creator_id?: string
          description?: string
          id?: string
          mediator_id?: string | null
          opponent_accepted?: boolean | null
          opponent_accepted_at?: string | null
          opponent_animal?: string | null
          opponent_email?: string | null
          resolution?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fights_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fights_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mediator_requests: {
        Row: {
          accepted_at: string | null
          accepted_by_creator: boolean | null
          accepted_by_opponent: boolean | null
          created_at: string | null
          creator_response: string | null
          fight_id: string
          id: string
          mediator_id: string
          opponent_response: string | null
          proposal_message: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_creator?: boolean | null
          accepted_by_opponent?: boolean | null
          created_at?: string | null
          creator_response?: string | null
          fight_id: string
          id?: string
          mediator_id: string
          opponent_response?: string | null
          proposal_message: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_creator?: boolean | null
          accepted_by_opponent?: boolean | null
          created_at?: string | null
          creator_response?: string | null
          fight_id?: string
          id?: string
          mediator_id?: string
          opponent_response?: string | null
          proposal_message?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mediator_requests_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: false
            referencedRelation: "fights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mediator_requests_mediator_id_fkey"
            columns: ["mediator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
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
      animal_type:
        | "lion"
        | "owl"
        | "fox"
        | "bear"
        | "rabbit"
        | "elephant"
        | "wolf"
        | "eagle"
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
    Enums: {
      animal_type: [
        "lion",
        "owl",
        "fox",
        "bear",
        "rabbit",
        "elephant",
        "wolf",
        "eagle",
      ],
    },
  },
} as const
