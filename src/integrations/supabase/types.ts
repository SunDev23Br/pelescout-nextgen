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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          avaliador_id: string | null
          candidato_id: string
          comentario: string | null
          created_at: string
          fisico: number | null
          id: string
          psicologico: number | null
          tatico: number | null
          tecnica: number | null
          updated_at: string
        }
        Insert: {
          avaliador_id?: string | null
          candidato_id: string
          comentario?: string | null
          created_at?: string
          fisico?: number | null
          id?: string
          psicologico?: number | null
          tatico?: number | null
          tecnica?: number | null
          updated_at?: string
        }
        Update: {
          avaliador_id?: string | null
          candidato_id?: string
          comentario?: string | null
          created_at?: string
          fisico?: number | null
          id?: string
          psicologico?: number | null
          tatico?: number | null
          tecnica?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
        ]
      }
      candidatos: {
        Row: {
          altura: number
          avatar: string | null
          celular: string
          cidade: string
          comentario: string | null
          created_at: string
          email: string
          id: string
          idade: number
          nome: string
          nota_geral: number | null
          pe: Database["public"]["Enums"]["pe_dominante"]
          peneira_id: string
          peso: number
          posicao: Database["public"]["Enums"]["posicao"]
          status: Database["public"]["Enums"]["status_candidato"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          altura: number
          avatar?: string | null
          celular: string
          cidade: string
          comentario?: string | null
          created_at?: string
          email: string
          id?: string
          idade: number
          nome: string
          nota_geral?: number | null
          pe?: Database["public"]["Enums"]["pe_dominante"]
          peneira_id: string
          peso: number
          posicao: Database["public"]["Enums"]["posicao"]
          status?: Database["public"]["Enums"]["status_candidato"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          altura?: number
          avatar?: string | null
          celular?: string
          cidade?: string
          comentario?: string | null
          created_at?: string
          email?: string
          id?: string
          idade?: number
          nome?: string
          nota_geral?: number | null
          pe?: Database["public"]["Enums"]["pe_dominante"]
          peneira_id?: string
          peso?: number
          posicao?: Database["public"]["Enums"]["posicao"]
          status?: Database["public"]["Enums"]["status_candidato"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_peneira_id_fkey"
            columns: ["peneira_id"]
            isOneToOne: false
            referencedRelation: "peneiras"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_desbloqueados: {
        Row: {
          candidato_id: string
          clube_id: string
          created_at: string
          id: string
        }
        Insert: {
          candidato_id: string
          clube_id: string
          created_at?: string
          id?: string
        }
        Update: {
          candidato_id?: string
          clube_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_desbloqueados_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
        ]
      }
      peneiras: {
        Row: {
          categorias: string[]
          cidade: string
          created_at: string
          created_by: string | null
          data: string
          descricao: string | null
          duracao_jogo_min: number
          estado: string
          hora_fim: string
          hora_inicio: string
          id: string
          imagem: string | null
          inscritos: number
          invite_token: string | null
          limite_inscricao: string
          local: string
          organizador: string
          participantes_por_jogo: number
          status: Database["public"]["Enums"]["status_peneira"]
          titulo: string
          updated_at: string
          visibilidade: Database["public"]["Enums"]["visibilidade"]
        }
        Insert: {
          categorias?: string[]
          cidade: string
          created_at?: string
          created_by?: string | null
          data: string
          descricao?: string | null
          duracao_jogo_min?: number
          estado: string
          hora_fim: string
          hora_inicio: string
          id?: string
          imagem?: string | null
          inscritos?: number
          invite_token?: string | null
          limite_inscricao: string
          local: string
          organizador?: string
          participantes_por_jogo?: number
          status?: Database["public"]["Enums"]["status_peneira"]
          titulo: string
          updated_at?: string
          visibilidade?: Database["public"]["Enums"]["visibilidade"]
        }
        Update: {
          categorias?: string[]
          cidade?: string
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string | null
          duracao_jogo_min?: number
          estado?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          imagem?: string | null
          inscritos?: number
          invite_token?: string | null
          limite_inscricao?: string
          local?: string
          organizador?: string
          participantes_por_jogo?: number
          status?: Database["public"]["Enums"]["status_peneira"]
          titulo?: string
          updated_at?: string
          visibilidade?: Database["public"]["Enums"]["visibilidade"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cnpj: string | null
          created_at: string
          email: string
          id: string
          nome: string
          nome_clube: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          nome_clube?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          nome_clube?: string | null
          updated_at?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "atleta" | "admin" | "clube"
      pe_dominante: "Destro" | "Canhoto"
      posicao:
        | "Goleiro"
        | "Zagueiro"
        | "Lateral"
        | "Volante"
        | "Meia"
        | "Atacante"
      status_candidato: "pendente" | "avaliado" | "aprovado" | "reprovado"
      status_peneira: "aberta" | "em_andamento" | "encerrada"
      visibilidade: "publica" | "privada"
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
      app_role: ["atleta", "admin", "clube"],
      pe_dominante: ["Destro", "Canhoto"],
      posicao: [
        "Goleiro",
        "Zagueiro",
        "Lateral",
        "Volante",
        "Meia",
        "Atacante",
      ],
      status_candidato: ["pendente", "avaliado", "aprovado", "reprovado"],
      status_peneira: ["aberta", "em_andamento", "encerrada"],
      visibilidade: ["publica", "privada"],
    },
  },
} as const
