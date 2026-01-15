import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/database.types";

export const runtime = "edge";

type DailyMetric = Pick<Tables<"daily_metrics">, "date" | "engagement" | "reach">;

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function formatDateYYYYMMDD(d: Date): string {
  // Always use UTC to avoid timezone drift.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req: Request) {
  // Require bearer token so RLS is enforced per-user.
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // Create client with Authorization header so Postgres RLS applies.
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Last 30 days including today (UTC)
  const today = new Date();
  const start = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - 29);

  const startStr = formatDateYYYYMMDD(start);
  const endStr = formatDateYYYYMMDD(today);

  const { data, error } = await supabase
    .from("daily_metrics")
    .select("date, engagement, reach")
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Normalize into exactly 30 days (fill missing days with 0s)
  const byDate = new Map<string, DailyMetric>();
  for (const row of data ?? []) {
    byDate.set(row.date, {
      date: row.date,
      engagement: row.engagement ?? 0,
      reach: row.reach ?? 0,
    });
  }

  const out: DailyMetric[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = formatDateYYYYMMDD(d);

    out.push(
      byDate.get(key) ?? {
        date: key,
        engagement: 0,
        reach: 0,
      }
    );
  }

  return NextResponse.json({ days: out });
}
