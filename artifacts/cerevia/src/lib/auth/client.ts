import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  if (_client) return _client
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }

  _client = createSupabaseClient(url, key)
  return _client
}
