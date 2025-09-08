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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          issued_at: string | null
          module_id: string | null
          qr_code: string | null
          trail_id: string | null
          type: Database["public"]["Enums"]["certificate_type"]
          user_id: string | null
        }
        Insert: {
          id?: string
          issued_at?: string | null
          module_id?: string | null
          qr_code?: string | null
          trail_id?: string | null
          type: Database["public"]["Enums"]["certificate_type"]
          user_id?: string | null
        }
        Update: {
          id?: string
          issued_at?: string | null
          module_id?: string | null
          qr_code?: string | null
          trail_id?: string | null
          type?: Database["public"]["Enums"]["certificate_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_professors: {
        Row: {
          class_id: string | null
          created_at: string | null
          id: string
          professor_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          professor_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          professor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_professors_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_professors_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_trails: {
        Row: {
          class_id: string | null
          created_at: string | null
          id: string
          trail_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          trail_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          id?: string
          trail_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_trails_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_trails_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["class_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["class_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["class_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string | null
          class_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          class_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          class_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_blocked: boolean | null
          module_id: string | null
          order_index: number
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_blocked?: boolean | null
          module_id?: string | null
          order_index: number
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_blocked?: boolean | null
          module_id?: string | null
          order_index?: number
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string | null
          enrolled_at: string | null
          final_grade: number | null
          id: string
          progress: number | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          enrolled_at?: string | null
          final_grade?: number | null
          id?: string
          progress?: number | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          enrolled_at?: string | null
          final_grade?: number | null
          id?: string
          progress?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          duration: number | null
          id: string
          meeting_id: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          user_id: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          duration?: number | null
          id?: string
          meeting_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          user_id?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          duration?: number | null
          id?: string
          meeting_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          class_id: string | null
          created_at: string | null
          date_time: string
          description: string | null
          duration: number
          host_user_id: string | null
          id: string
          max_participants: number | null
          meeting_url: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date_time: string
          description?: string | null
          duration: number
          host_user_id?: string | null
          id?: string
          max_participants?: number | null
          meeting_url?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date_time?: string
          description?: string | null
          duration?: number
          host_user_id?: string | null
          id?: string
          max_participants?: number | null
          meeting_url?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_blocked: boolean | null
          order_index: number
          title: string
          trail_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_blocked?: boolean | null
          order_index: number
          title: string
          trail_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_blocked?: boolean | null
          order_index?: number
          title?: string
          trail_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: Json
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          order_index: number
          points: number
          question: string
          quiz_id: string | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer: Json
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index: number
          points?: number
          question: string
          quiz_id?: string | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: Json
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question?: string
          quiz_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          allow_retakes: boolean | null
          content_id: string | null
          created_at: string | null
          description: string | null
          id: string
          passing_score: number
          show_correct_answers: boolean | null
          time_limit: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_retakes?: boolean | null
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          passing_score?: number
          show_correct_answers?: boolean | null
          time_limit?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_retakes?: boolean | null
          content_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          passing_score?: number
          show_correct_answers?: boolean | null
          time_limit?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          certificate_enabled: boolean | null
          certificate_type:
            | Database["public"]["Enums"]["certificate_type"]
            | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          level: Database["public"]["Enums"]["difficulty_level"]
          title: string
          updated_at: string | null
        }
        Insert: {
          certificate_enabled?: boolean | null
          certificate_type?:
            | Database["public"]["Enums"]["certificate_type"]
            | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          level: Database["public"]["Enums"]["difficulty_level"]
          title: string
          updated_at?: string | null
        }
        Update: {
          certificate_enabled?: boolean | null
          certificate_type?:
            | Database["public"]["Enums"]["certificate_type"]
            | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          level?: Database["public"]["Enums"]["difficulty_level"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed: boolean | null
          content_id: string | null
          id: string
          last_accessed: string | null
          percentage: number | null
          user_id: string | null
          video_duration: number | null
          video_time: number | null
        }
        Insert: {
          completed?: boolean | null
          content_id?: string | null
          id?: string
          last_accessed?: string | null
          percentage?: number | null
          user_id?: string | null
          video_duration?: number | null
          video_time?: number | null
        }
        Update: {
          completed?: boolean | null
          content_id?: string | null
          id?: string
          last_accessed?: string | null
          percentage?: number | null
          user_id?: string | null
          video_duration?: number | null
          video_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          name: string
        }[]
      }
      get_user_roles: {
        Args: { user_uuid?: string }
        Returns: string[]
      }
      has_role: {
        Args: { role_name: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      attendance_status: "present" | "absent" | "late"
      certificate_type: "trail" | "module"
      class_status: "active" | "completed" | "paused"
      content_type: "video" | "pdf" | "quiz" | "live"
      difficulty_level: "Iniciante" | "Intermediário" | "Avançado"
      meeting_status: "scheduled" | "live" | "completed" | "cancelled"
      notification_type: "info" | "success" | "warning" | "error"
      question_type:
        | "multiple-choice"
        | "single-choice"
        | "true-false"
        | "number"
        | "text"
      user_role: "admin" | "professor" | "aluno"
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
      attendance_status: ["present", "absent", "late"],
      certificate_type: ["trail", "module"],
      class_status: ["active", "completed", "paused"],
      content_type: ["video", "pdf", "quiz", "live"],
      difficulty_level: ["Iniciante", "Intermediário", "Avançado"],
      meeting_status: ["scheduled", "live", "completed", "cancelled"],
      notification_type: ["info", "success", "warning", "error"],
      question_type: [
        "multiple-choice",
        "single-choice",
        "true-false",
        "number",
        "text",
      ],
      user_role: ["admin", "professor", "aluno"],
    },
  },
} as const
