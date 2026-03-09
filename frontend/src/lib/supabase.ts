import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'SUPABASE_URL_REMOVED'
const supabaseAnonKey =
  'SUPABASE_ANON_KEY_REMOVED'

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
