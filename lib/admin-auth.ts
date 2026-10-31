import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Confirms the bearer token belongs to an admin by asking Postgres (is_admin() runs under the caller's JWT),
 * so the admin list stays in one place and no service key is involved.
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!url || !anonKey || !token) return false

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data, error } = await client.rpc("is_admin")
  return !error && data === true
}
