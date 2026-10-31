import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getServerEnv } from "@/lib/server-env"

/** Service-role client for trusted server code only (bypasses RLS). Null when not configured. */
export function getSupabaseService(): SupabaseClient | null {
  const { supabaseUrl, serviceRoleKey } = getServerEnv()
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
