import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

let client: SupabaseClient | null | undefined

/** Browser client using the public anon key (RLS enforces access). Null when Supabase isn't configured. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key) : null
  return client
}
