import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Service-role client for webhooks and cron jobs (bypasses RLS). */
export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
