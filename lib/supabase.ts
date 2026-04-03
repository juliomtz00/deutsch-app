import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export type Database = {
  public: {
    Tables: {
      vocabulary: {
        Row: {
          id: string
          german: string
          english: string
          spanish: string
          preposition: string | null
          example: string
          priority: number
          added_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          german: string
          english: string
          spanish: string
          preposition?: string | null
          example: string
          priority?: number
          added_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          german?: string
          english?: string
          spanish?: string
          preposition?: string | null
          example?: string
          priority?: number
          added_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          vocabulary_id: string
          confidence_rating: number | null
          grammar_score: number | null
          practice_mode: string
          practiced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vocabulary_id: string
          confidence_rating?: number | null
          grammar_score?: number | null
          practice_mode: string
          practiced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vocabulary_id?: string
          confidence_rating?: number | null
          grammar_score?: number | null
          practice_mode?: string
          practiced_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_practiced: number
          unique_words_count: number
          current_streak: number
          longest_streak: number
          last_practice_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_practiced?: number
          unique_words_count?: number
          current_streak?: number
          longest_streak?: number
          last_practice_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_practiced?: number
          unique_words_count?: number
          current_streak?: number
          longest_streak?: number
          last_practice_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client
export const createClient = () => createClientComponentClient<Database>()

// Server-side Supabase client (pass cookies from the calling component)
export const createServerClient = (cookieStore: any) => 
  createServerComponentClient<Database>({ cookies: () => cookieStore })
