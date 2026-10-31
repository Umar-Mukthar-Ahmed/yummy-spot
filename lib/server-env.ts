import "server-only"

/** Server-only secrets, read per call because Workers populate process.env per request. */
export function getServerEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
    ipHashSalt: process.env.IP_HASH_SALT ?? "",
    telegramToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
    defaultCountryCode: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE ?? "",
  }
}
