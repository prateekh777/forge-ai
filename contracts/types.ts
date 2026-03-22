// AUTO-GENERATED — do not edit manually.
// Regenerate with: supabase gen types typescript --local > contracts/types.ts
//
// This is a hand-authored placeholder that mirrors the schema in contracts/database.sql.
// Replace with the generated output once `supabase start` + `supabase db reset` have been run.

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
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_id: string | null
          customer_email: string
          customer_name: string
          task_description: string
          task_type: 'automation' | 'content' | 'agent' | 'integration' | 'data' | 'other'
          uploaded_file_urls: string[]
          customer_notes: string | null
          complexity_score: number | null
          confidence_score: number | null
          suggested_pipeline: string | null
          quoted_price_cents: number
          cost_to_us_cents: number
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          execution_status: 'queued' | 'classifying' | 'running' | 'qa_review' | 'delivered' | 'failed' | 'revision' | 'cancelled'
          assigned_pipeline: string | null
          deliverable_url: string | null
          referral_code: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id?: string | null
          customer_email: string
          customer_name: string
          task_description: string
          task_type?: 'automation' | 'content' | 'agent' | 'integration' | 'data' | 'other'
          uploaded_file_urls?: string[]
          customer_notes?: string | null
          complexity_score?: number | null
          confidence_score?: number | null
          suggested_pipeline?: string | null
          quoted_price_cents: number
          cost_to_us_cents?: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          execution_status?: 'queued' | 'classifying' | 'running' | 'qa_review' | 'delivered' | 'failed' | 'revision' | 'cancelled'
          assigned_pipeline?: string | null
          deliverable_url?: string | null
          referral_code?: string | null
          metadata?: Json
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      deliveries: {
        Row: {
          id: string
          order_id: string
          delivered_at: string
          deliverable_type: 'file' | 'url' | 'code_repo' | 'api_endpoint' | 'report' | 'other'
          deliverable_url: string
          deliverable_description: string | null
          execution_log: Json
          pipeline_used: string
          pipeline_version: number
          execution_time_seconds: number | null
          cost_to_us_cents: number
          qa_passed: boolean
          qa_notes: string | null
          qa_attempts: number
        }
        Insert: {
          id?: string
          order_id: string
          delivered_at?: string
          deliverable_type: 'file' | 'url' | 'code_repo' | 'api_endpoint' | 'report' | 'other'
          deliverable_url: string
          deliverable_description?: string | null
          execution_log?: Json
          pipeline_used: string
          pipeline_version?: number
          execution_time_seconds?: number | null
          cost_to_us_cents?: number
          qa_passed?: boolean
          qa_notes?: string | null
          qa_attempts?: number
        }
        Update: Partial<Database['public']['Tables']['deliveries']['Insert']>
      }
      feedback: {
        Row: {
          id: string
          order_id: string
          delivery_id: string | null
          created_at: string
          rating: number
          comment: string | null
          revision_requested: boolean
          revision_details: string | null
          tags: string[]
          sentiment_score: number | null
          issue_category: string | null
        }
        Insert: {
          id?: string
          order_id: string
          delivery_id?: string | null
          created_at?: string
          rating: number
          comment?: string | null
          revision_requested?: boolean
          revision_details?: string | null
          tags?: string[]
          sentiment_score?: number | null
          issue_category?: string | null
        }
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>
      }
      pipeline_improvements: {
        Row: {
          id: string
          pipeline_name: string
          improvement_type: 'prompt_update' | 'flow_change' | 'new_step' | 'parameter_tune'
          description: string | null
          before_success_rate: number | null
          after_success_rate: number | null
          triggered_by_feedback_ids: string[]
          applied_at: string | null
          applied_by: string | null
          status: string
        }
        Insert: {
          id?: string
          pipeline_name: string
          improvement_type: 'prompt_update' | 'flow_change' | 'new_step' | 'parameter_tune'
          description?: string | null
          before_success_rate?: number | null
          after_success_rate?: number | null
          triggered_by_feedback_ids?: string[]
          applied_at?: string | null
          applied_by?: string | null
          status?: string
        }
        Update: Partial<Database['public']['Tables']['pipeline_improvements']['Insert']>
      }
      execution_logs: {
        Row: {
          id: string
          order_id: string
          created_at: string
          step_name: string
          step_index: number
          input_summary: string | null
          output_summary: string | null
          duration_ms: number | null
          tokens_used: number
          cost_cents: number
          provider: string | null
          model: string | null
          success: boolean
          error_message: string | null
        }
        Insert: {
          id?: string
          order_id: string
          created_at?: string
          step_name: string
          step_index: number
          input_summary?: string | null
          output_summary?: string | null
          duration_ms?: number | null
          tokens_used?: number
          cost_cents?: number
          provider?: string | null
          model?: string | null
          success?: boolean
          error_message?: string | null
        }
        Update: Partial<Database['public']['Tables']['execution_logs']['Insert']>
      }
      pipeline_metrics: {
        Row: {
          id: string
          pipeline_name: string
          period_start: string
          period_end: string
          total_runs: number
          success_count: number
          failure_count: number
          avg_execution_seconds: number | null
          avg_cost_cents: number | null
          avg_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          pipeline_name: string
          period_start: string
          period_end: string
          total_runs?: number
          success_count?: number
          failure_count?: number
          avg_execution_seconds?: number | null
          avg_cost_cents?: number | null
          avg_rating?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['pipeline_metrics']['Insert']>
      }
      task_patterns: {
        Row: {
          id: string
          pattern_name: string
          description: string | null
          task_type: 'automation' | 'content' | 'agent' | 'integration' | 'data' | 'other' | null
          example_order_ids: string[]
          frequency: number
          avg_price_cents: number | null
          avg_success_rate: number | null
          avg_margin_pct: number | null
          growth_trend: number | null
          product_opportunity_score: number | null
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pattern_name: string
          description?: string | null
          task_type?: 'automation' | 'content' | 'agent' | 'integration' | 'data' | 'other' | null
          example_order_ids?: string[]
          frequency?: number
          avg_price_cents?: number | null
          avg_success_rate?: number | null
          avg_margin_pct?: number | null
          growth_trend?: number | null
          product_opportunity_score?: number | null
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['task_patterns']['Insert']>
      }
      pipeline_versions: {
        Row: {
          id: string
          pipeline_name: string
          version: number
          config: Json
          prompt_templates: Json
          created_at: string
          created_by: string | null
          is_active: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          pipeline_name: string
          version: number
          config: Json
          prompt_templates?: Json
          created_at?: string
          created_by?: string | null
          is_active?: boolean
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['pipeline_versions']['Insert']>
      }
      referrals: {
        Row: {
          id: string
          referrer_customer_id: string | null
          referrer_code: string
          referred_email: string | null
          referred_order_id: string | null
          credit_cents: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          referrer_customer_id?: string | null
          referrer_code: string
          referred_email?: string | null
          referred_order_id?: string | null
          credit_cents?: number
          status?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      task_type: 'automation' | 'content' | 'agent' | 'integration' | 'data' | 'other'
      payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
      execution_status: 'queued' | 'classifying' | 'running' | 'qa_review' | 'delivered' | 'failed' | 'revision' | 'cancelled'
      deliverable_type: 'file' | 'url' | 'code_repo' | 'api_endpoint' | 'report' | 'other'
      improvement_type: 'prompt_update' | 'flow_change' | 'new_step' | 'parameter_tune'
    }
  }
}
