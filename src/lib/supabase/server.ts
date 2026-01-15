import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

/**
 * Server-side Supabase client for Route Handlers.
 *
 * We attach a Bearer token when available so Postgres RLS policies apply.
 * Prefer passing `accessToken` from the request (e.g., Authorization header).
 *
 * Note: Supabase cookie names can vary by project and auth helpers.
 * For this coding challenge, we keep the helper small and predictable.
 */
export async function supabaseServerClient(accessToken?: string) {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get("sb-access-token")?.value;
  const token = accessToken ?? tokenFromCookie;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
  });
}
