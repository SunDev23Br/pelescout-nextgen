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
      admin_requests: {
        Row: {
          celular: string | null
          clube_atual: string | null
          created_at: string
          id: string
          idade: number | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rg_frente_path: string | null
          rg_verso_path: string | null
          status: Database["public"]["Enums"]["admin_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          celular?: string | null
          clube_atual?: string | null
          created_at?: string
          id?: string
          idade?: number | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rg_frente_path?: string | null
          rg_verso_path?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          celular?: string | null
          clube_atual?: string | null
          created_at?: string
          id?: string
          idade?: number | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rg_frente_path?: string | null
          rg_verso_path?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_skill_history: {
        Row: {
          atleta_id: string
          created_at: string
          id: string
          skills: Json
          source: string
          validator_id: string | null
        }
        Insert: {
          atleta_id: string
          created_at?: string
          id?: string
          skills: Json
          source: string
          validator_id?: string | null
        }
        Update: {
          atleta_id?: string
          created_at?: string
          id?: string
          skills?: Json
          source?: string
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_skill_history_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_skill_validators: {
        Row: {
          accepted_at: string | null
          atleta_id: string
          created_at: string
          id: string
          invited_email: string | null
          invited_name: string | null
          status: string
          validator_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          atleta_id: string
          created_at?: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          status?: string
          validator_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          atleta_id?: string
          created_at?: string
          id?: string
          invited_email?: string | null
          invited_name?: string | null
          status?: string
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_skill_validators_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_videos: {
        Row: {
          atleta_id: string
          created_at: string
          id: string
          mime: string | null
          path: string
          size: number | null
          titulo: string | null
        }
        Insert: {
          atleta_id: string
          created_at?: string
          id?: string
          mime?: string | null
          path: string
          size?: number | null
          titulo?: string | null
        }
        Update: {
          atleta_id?: string
          created_at?: string
          id?: string
          mime?: string | null
          path?: string
          size?: number | null
          titulo?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          atleta_user_id: string | null
          avaliador_id: string | null
          candidato_id: string | null
          comentario: string | null
          created_at: string
          decisao: string | null
          fisico: number | null
          id: string
          intensidade: number | null
          mental: number | null
          nota_geral: number | null
          pe_bonus: number | null
          peneira_id: string | null
          psicologico: number | null
          tags_negativas: string[] | null
          tags_positivas: string[] | null
          tatico: number | null
          tecnica: number | null
          updated_at: string
        }
        Insert: {
          atleta_user_id?: string | null
          avaliador_id?: string | null
          candidato_id?: string | null
          comentario?: string | null
          created_at?: string
          decisao?: string | null
          fisico?: number | null
          id?: string
          intensidade?: number | null
          mental?: number | null
          nota_geral?: number | null
          pe_bonus?: number | null
          peneira_id?: string | null
          psicologico?: number | null
          tags_negativas?: string[] | null
          tags_positivas?: string[] | null
          tatico?: number | null
          tecnica?: number | null
          updated_at?: string
        }
        Update: {
          atleta_user_id?: string | null
          avaliador_id?: string | null
          candidato_id?: string | null
          comentario?: string | null
          created_at?: string
          decisao?: string | null
          fisico?: number | null
          id?: string
          intensidade?: number | null
          mental?: number | null
          nota_geral?: number | null
          pe_bonus?: number | null
          peneira_id?: string | null
          psicologico?: number | null
          tags_negativas?: string[] | null
          tags_positivas?: string[] | null
          tatico?: number | null
          tecnica?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_atleta_user_id_fkey"
            columns: ["atleta_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_peneira_id_fkey"
            columns: ["peneira_id"]
            isOneToOne: false
            referencedRelation: "peneiras"
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
          data_nascimento: string
          email: string
          id: string
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
          data_nascimento: string
          email: string
          id?: string
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
          data_nascimento?: string
          email?: string
          id?: string
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
      chat_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      chat_reports: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          motivo: string
          reported_id: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          motivo: string
          reported_id: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          motivo?: string
          reported_id?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clube_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["admin_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["admin_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      conversations: {
        Row: {
          atleta_id: string
          created_at: string
          id: string
          iniciador_id: string
          last_message_at: string
          last_message_preview: string | null
          last_sender_id: string | null
        }
        Insert: {
          atleta_id: string
          created_at?: string
          id?: string
          iniciador_id: string
          last_message_at?: string
          last_message_preview?: string | null
          last_sender_id?: string | null
        }
        Update: {
          atleta_id?: string
          created_at?: string
          id?: string
          iniciador_id?: string
          last_message_at?: string
          last_message_preview?: string | null
          last_sender_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["message_kind"]
          media_mime: string | null
          media_path: string | null
          media_size: number | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_mime?: string | null
          media_path?: string | null
          media_size?: number | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["message_kind"]
          media_mime?: string | null
          media_path?: string | null
          media_size?: number | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
          altura: number | null
          avatar_url: string | null
          bio: string | null
          celular: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          historico_clubes: Json
          id: string
          nome: string
          nome_clube: string | null
          pe: Database["public"]["Enums"]["pe_dominante"] | null
          peso: number | null
          posicao: Database["public"]["Enums"]["posicao"] | null
          skills: Json
          skills_validated: Json | null
          skills_validated_at: string | null
          skills_validated_by: string | null
          stats: Json
          updated_at: string
        }
        Insert: {
          altura?: number | null
          avatar_url?: string | null
          bio?: string | null
          celular?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          historico_clubes?: Json
          id: string
          nome: string
          nome_clube?: string | null
          pe?: Database["public"]["Enums"]["pe_dominante"] | null
          peso?: number | null
          posicao?: Database["public"]["Enums"]["posicao"] | null
          skills?: Json
          skills_validated?: Json | null
          skills_validated_at?: string | null
          skills_validated_by?: string | null
          stats?: Json
          updated_at?: string
        }
        Update: {
          altura?: number | null
          avatar_url?: string | null
          bio?: string | null
          celular?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          historico_clubes?: Json
          id?: string
          nome?: string
          nome_clube?: string | null
          pe?: Database["public"]["Enums"]["pe_dominante"] | null
          peso?: number | null
          posicao?: Database["public"]["Enums"]["posicao"] | null
          skills?: Json
          skills_validated?: Json | null
          skills_validated_at?: string | null
          skills_validated_by?: string | null
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          is_online: boolean
          last_seen_at: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen_at?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen_at?: string
          user_id?: string
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
      wearable_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          external_user_id: string | null
          id: string
          last_sync_at: string | null
          last_sync_error: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          refresh_token: string | null
          scopes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          external_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          provider: Database["public"]["Enums"]["wearable_provider"]
          refresh_token?: string | null
          scopes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          external_user_id?: string | null
          id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          provider?: Database["public"]["Enums"]["wearable_provider"]
          refresh_token?: string | null
          scopes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wearable_daily_metrics: {
        Row: {
          active_minutes: number | null
          created_at: string
          distance_m: number | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          heart_rate_resting: number | null
          id: string
          metric_date: string
          provider: Database["public"]["Enums"]["wearable_provider"]
          raw_payload: Json | null
          speed_avg_kmh: number | null
          steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          created_at?: string
          distance_m?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_resting?: number | null
          id?: string
          metric_date: string
          provider: Database["public"]["Enums"]["wearable_provider"]
          raw_payload?: Json | null
          speed_avg_kmh?: number | null
          steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          created_at?: string
          distance_m?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          heart_rate_resting?: number | null
          id?: string
          metric_date?: string
          provider?: Database["public"]["Enums"]["wearable_provider"]
          raw_payload?: Json | null
          speed_avg_kmh?: number | null
          steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_skill_validator_invite: {
        Args: { _invite_id: string }
        Returns: undefined
      }
      approve_admin_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      approve_clube_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      can_validate_athlete: {
        Args: { _atleta: string; _validator: string }
        Returns: boolean
      }
      clube_has_unlocked_atleta: {
        Args: { _atleta_user_id: string; _clube_id: string }
        Returns: boolean
      }
      get_conversation_peers: {
        Args: { _conv_ids: string[] }
        Returns: {
          avatar_url: string
          conversation_id: string
          nome: string
          peer_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conv_id: string; _user_id: string }
        Returns: boolean
      }
      list_atletas_aprovados: {
        Args: never
        Returns: {
          avatar_url: string
          candidato_id: string
          cidade: string
          data_nascimento: string
          nome: string
          nota_geral: number
          peneira_titulo: string
          posicao: string
          user_id: string
        }[]
      }
      reject_admin_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      reject_clube_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      set_validated_skills: {
        Args: { _atleta: string; _skills: Json }
        Returns: undefined
      }
      users_blocked: { Args: { _a: string; _b: string }; Returns: boolean }
      users_share_conversation: {
        Args: { _a: string; _b: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_request_status: "pending" | "approved" | "rejected"
      app_role: "atleta" | "admin" | "clube" | "suporte"
      message_kind: "text" | "image" | "video" | "file"
      pe_dominante: "Destro" | "Canhoto"
      posicao:
        | "Goleiro"
        | "Zagueiro"
        | "Lateral"
        | "Volante"
        | "Meia"
        | "Atacante"
      report_status: "open" | "reviewed" | "dismissed"
      status_candidato: "pendente" | "avaliado" | "aprovado" | "reprovado"
      status_peneira: "aberta" | "em_andamento" | "encerrada"
      visibilidade: "publica" | "privada"
      wearable_provider: "google_fit" | "fitbit" | "mock"
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
      admin_request_status: ["pending", "approved", "rejected"],
      app_role: ["atleta", "admin", "clube", "suporte"],
      message_kind: ["text", "image", "video", "file"],
      pe_dominante: ["Destro", "Canhoto"],
      posicao: [
        "Goleiro",
        "Zagueiro",
        "Lateral",
        "Volante",
        "Meia",
        "Atacante",
      ],
      report_status: ["open", "reviewed", "dismissed"],
      status_candidato: ["pendente", "avaliado", "aprovado", "reprovado"],
      status_peneira: ["aberta", "em_andamento", "encerrada"],
      visibilidade: ["publica", "privada"],
      wearable_provider: ["google_fit", "fitbit", "mock"],
    },
  },
} as const
