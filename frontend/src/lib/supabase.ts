import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Channel {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Message {
  id: string
  channel_id: string
  author_name: string
  content: string
  created_at: string
}
